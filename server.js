const express = require('express');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const { Dog, calculate_geographic_distance, match_dogs } = require('./dogMatching');
const multer = require('multer');
const { Expo } = require('expo-server-sdk');
const admin = require("./firebaseAdmin");
const bucket = admin.storage().bucket();
const path = require('path');
const cors = require('cors');
const http = require('http');
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");

const sql = neon(process.env.DATABASE_URL);
const expo = new Expo();
const app = express();

const helmet = require("helmet");
const compression = require("compression");

app.use(express.json());
app.use(cors({
  origin: ["https://walkey.com", "https://walkey-production.up.railway.app"],
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: "1mb" })); 
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted-cdn.com"],
      imgSrc: ["'self'", "data:", "https://firebasestorage.googleapis.com"],
      connectSrc: ["'self'", "https://walkey.com", "https://walkey-production.up.railway.app", "https://firebasestorage.googleapis.com"],
      frameAncestors: ["'none'"], 
      upgradeInsecureRequests: [],
    }
  },
  frameguard: { action: "deny" },
  referrerPolicy: { policy: "no-referrer" },
  hidePoweredBy: true
}));

app.use(compression());

const fixFirebaseUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  if (!url.startsWith("https://storage.googleapis.com")) {
    return url;
  }

  const bucketName = "walkeyapp.firebasestorage.app";
  const path = url.replace(`https://storage.googleapis.com/${bucketName}/`, "");
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media`;
};

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Можно загружать только изображения"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});


const generateUniqueCode = async () => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = Math.random().toString().slice(2, 18); 
    if (code.length === 16) {
      const existingCode = await sql`
        SELECT unique_code FROM users WHERE unique_code = ${code};
      `;
      if (existingCode.length === 0) {
        isUnique = true;
      }
    }
  }

  return code;
};

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  message: "Дуже багато запросів, спробуйте пізніше",
  keyGenerator: (req) => req.headers["x-real-ip"] || req.ip,
  headers: true,
}); 

app.use(limiter);

app.use(morgan("combined"));

const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Нет доступа, требуется авторизация" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Ошибка верификации токена:", err.message);
      return res.status(403).json({ error: "Токен истёк или недействителен" });
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (user.exp && user.exp < now) {
      return res.status(403).json({ error: "Токен истёк, авторизуйтесь заново" });
    }

    req.user = user;
    next();
  });
};

app.disable("x-powered-by");

app.use((err, req, res, next) => {
  console.error("Ошибка:", err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "Ошибка загрузки файла", details: err.message });
  }
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Неавторизованный доступ" });
  }
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { clerkId } = req.body;
  
  if (!clerkId || !req.file) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const fileName = `${clerkId}/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on("error", (err) => {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Ошибка загрузки файла" });
    });

    stream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      try {
        await sql`
          UPDATE users SET image = ${publicUrl} WHERE clerk_id = ${clerkId};
        `;
      } catch (dbError) {
        console.error("Ошибка сохранения URL в БД:", dbError);
        await file.delete();
        return res.status(500).json({ error: "Ошибка сохранения в базе данных" });
      }

      res.status(200).json({ success: true, url: publicUrl });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});


app.get("/api/user/image", async (req, res) => {
  const { clerkId } = req.query;

  if (!clerkId) {
    return res.status(400).json({ error: "clerkId is required" });
  }

  try {
    const user = await sql`
      SELECT image FROM users WHERE clerk_id = ${clerkId};
    `;

    if (!user.length || !user[0].image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.status(200).json({ imageUrl: user[0].image });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Локальный сервер работает!" });
});

app.post('/api/user', [
  body('name').trim().notEmpty().withMessage('Імя обовязкове для введення'),
  body('email').isEmail().withMessage('Некоректный email'),
  body('clerkId').trim().notEmpty().withMessage('clerkId обовязковий'),
  body('gender').isIn(['male', 'female']).withMessage('Невірний пол'),
  body('birthDate').isISO8601().withMessage('Дата народження повинна бути у форматі YYYY-MM-DD'),
  body('breed').trim().notEmpty().withMessage('Порода обовязкова'),
  body('activityLevel').isInt({ min: 1, max: 10 }).withMessage('Рівень активности повинен бути від 1 до 10')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, clerkId, gender, birthDate, image } = req.body;
  
  try {
      const uniqueCode = await generateUniqueCode();

      await sql`
          INSERT INTO users (name, email, clerk_id, gender, birth_date, image, unique_code)
          VALUES (${name}, ${email}, ${clerkId}, ${gender}, ${birthDate}, ${image || null}, ${uniqueCode})
          ON CONFLICT (clerk_id) DO NOTHING;
      `;

      res.status(201).json({ success: true });
  } catch (error) {
      console.error("Error saving data to database:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/dogs/user', async (req, res) => {
  const { clerkId } = req.query;

  if (!clerkId) {
    return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
    const dogs = await sql`
      SELECT * FROM dogs
      WHERE clerk_id = ${clerkId};
    `;

    if (dogs.length === 0) {
      return res.status(404).json({ error: 'No dogs found for the current user' });
    }

    const user = await sql`
      SELECT image FROM users WHERE clerk_id = ${clerkId};
    `;

    const updatedDogs = dogs.map((dog) => ({
      ...dog,
      image: user[0]?.image || null, 
      clerk_id: dog.clerk_id || user[0]?.clerk_id,
      status: dog.status || 'вдома',
    }));

    res.status(200).json(updatedDogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/api/dogs/matched', async (req, res) => {
  const { breed, minAge, maxAge, clerkId } = req.query;

  if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
      const dogsQuery = await sql`SELECT * FROM dogs WHERE clerk_id != ${clerkId};`;
      const userDogQuery = await sql`SELECT * FROM dogs WHERE clerk_id = ${clerkId};`;

      if (dogsQuery.length === 0 || userDogQuery.length === 0) {
          return res.status(404).json({ error: 'No dogs found' });
      }

      const userDog = userDogQuery[0];
      const targetDog = new Dog(
          userDog.dog_id,
          userDog.breed,
          userDog.weight,
          userDog.age,
          userDog.emotional_status,
          userDog.activity_level,
          userDog.latitude,
          userDog.longitude,
          userDog.after_walk_points || [],
          [],
          userDog.vaccination_status,
          userDog.anti_tick,
          userDog.status
      );

      const dogs = dogsQuery.map(dogData => new Dog(
          dogData.dog_id,
          dogData.breed,
          dogData.weight,
          dogData.age,
          dogData.emotional_status,
          dogData.activity_level,
          dogData.latitude,
          dogData.longitude,
          dogData.after_walk_points || [],
          [],
          dogData.vaccination_status,
          dogData.anti_tick,
          dogData.status
      ));

      const matchedDogs = match_dogs(targetDog, dogs, 50);

      res.status(200).json(matchedDogs);
  } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/dog', authenticateToken, async (req, res) => {
  const { clerkId, breed, age, weight, emotionalStatus, activityLevel, vaccinationStatus } = req.body;

  if (!clerkId || !breed || !age || !weight || !emotionalStatus || !activityLevel || !vaccinationStatus) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
      const response = await sql`
          INSERT INTO dogs (clerk_id, breed, age, weight, emotional_status, activity_level, vaccination_status)
          VALUES (${clerkId}, ${breed}, ${age}, ${weight}, ${emotionalStatus}, ${activityLevel}, ${vaccinationStatus})
          RETURNING *;
      `;
      res.status(201).json({ data: response });
  } catch (error) {
      console.error('Error creating dog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/user', async (req, res) => {
  const { clerkId, uniqueCode } = req.query;

  if (!clerkId && !uniqueCode) {
    return res.status(400).json({ error: 'clerkId или uniqueCode обязательны' });
  }

  try {
    let user;
    if (clerkId) {
      user = await sql`
        SELECT u.name, u.email, u.gender, u.birth_date, u.image, u.unique_code, d.breed
        FROM users u
        LEFT JOIN dogs d ON u.clerk_id = d.clerk_id
        WHERE u.clerk_id = ${clerkId};
      `;
    } else if (uniqueCode) {
      user = await sql`
        SELECT u.name, u.email, u.gender, u.birth_date, u.image, u.unique_code, d.breed
        FROM users u
        LEFT JOIN dogs d ON u.clerk_id = d.clerk_id
        WHERE u.unique_code = ${uniqueCode};
      `;
    }

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    user[0].image = fixFirebaseUrl(user[0].image);

    res.status(200).json(user[0]);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.patch('/api/user', authenticateToken, async (req, res) => {
  const { clerkId, birthDate } = req.body;

  if (!clerkId || !birthDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await sql`
      UPDATE users
      SET birth_date = ${birthDate}
      WHERE clerk_id = ${clerkId}
      RETURNING *;
    `;
    if (response.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ success: true, data: response[0] });
  } catch (error) {
    console.error('Error updating birth date:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.patch('/api/user/image', authenticateToken, upload.single('image'), async (req, res) => {
  const { clerkId } = req.body;

  if (!clerkId || !req.file) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const imagePath = `/images/${req.file.filename}`; 

    const response = await sql`
      UPDATE users
      SET image = ${imagePath}
      WHERE clerk_id = ${clerkId}
      RETURNING *;
    `;

    if (response.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ success: true, image: imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.patch('/api/user/location', authenticateToken, async (req, res) => {
  const { clerkId, latitude, longitude } = req.body;

  if (!clerkId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
      const response = await sql`
          INSERT INTO user_locations (clerk_id, latitude, longitude, last_updated)
          VALUES (${clerkId}, ${latitude}, ${longitude}, now())
          ON CONFLICT (clerk_id) DO UPDATE
          SET latitude = ${latitude}, longitude = ${longitude}, last_updated = now()
          RETURNING *;
      `;
      res.status(200).json({ data: response });
  } catch (error) {
      console.error('Error updating user location:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/user/location', authenticateToken, async (req, res) => {
  const { clerkId } = req.query;

  if (!clerkId) {
    return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
    const location = await sql`
      SELECT latitude, longitude 
      FROM user_locations 
      WHERE clerk_id = ${clerkId};
    `;

    if (location.length === 0) {
      return res.status(404).json({ error: 'User location not found' });
    }

    res.status(200).json(location[0]);
  } catch (error) {
    console.error('Ошибка при получении местоположения пользователя:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/users/locations', authenticateToken, async (req, res) => {
const { clerkId, breed, maxAge, minAge, gender, castrated, noHeat, status } = req.query;

if (!clerkId) {
  return res.status(400).json({ error: 'clerkId is required' });
}

try {
  const userLocationQuery = await sql`
    SELECT latitude, longitude FROM user_locations WHERE clerk_id = ${clerkId};
  `;

  if (userLocationQuery.length === 0) {
    return res.status(404).json({ error: 'User location not found' });
  }

  const userLocation = userLocationQuery[0];
  const dogsQuery = await sql`
  SELECT d.breed, d.age, d.status, d.castrated, d.in_heat, ul.latitude, ul.longitude,  u.clerk_id, u.gender, u.name, u.image,
         earth_distance(ll_to_earth(${userLocation.latitude}, ${userLocation.longitude}),
                        ll_to_earth(ul.latitude, ul.longitude)) AS distance
  FROM dogs d
  JOIN user_locations ul ON d.clerk_id = ul.clerk_id
  JOIN users u ON d.clerk_id = u.clerk_id
  WHERE d.clerk_id != ${clerkId}
  AND (COALESCE(${gender}, '') = '' OR LOWER(u.gender) = LOWER(${gender}))
  AND (COALESCE(${breed}, '') = '' OR LOWER(d.breed) = LOWER(${breed}))
  AND (COALESCE(${maxAge}, '') = '' OR d.age <= ${maxAge})
  AND (COALESCE(${minAge}, '') = '' OR d.age >= ${minAge})
  AND (COALESCE(${castrated}, '') = '' OR d.castrated = ${castrated})
  AND (COALESCE(${noHeat}, '') = '' OR d.in_heat = false)
  AND (COALESCE(${status}, '') = '' OR d.status = ${status}) 
  ORDER BY distance ASC;
`;
  

  if (dogsQuery.length === 0) {
    return res.status(404).json({ error: 'No matching dogs found' });
  }

  res.status(200).json(dogsQuery);
} catch (error) {
  console.error('Ошибка при получении данных:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});

// "vaccination" and "protection"
app.get('/api/medical/records', authenticateToken, async (req, res) => {
  const { type, clerkId } = req.query;

  if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
      const records = await sql`
          SELECT * FROM medical_records
          WHERE clerk_id = ${clerkId} AND (COALESCE(${type}, '') = '' OR type = ${type});
      `;
      res.status(200).json(records);
  } catch (error) {
      console.error('Error fetching medical records:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/vaccinations', authenticateToken, async (req, res) => {
  const { clerkId } = req.query;

  if (!clerkId) {
    return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
    const vaccinations = await sql`
      SELECT name, type, lastdate, nextdate
      FROM medical_records
      WHERE clerk_id = ${clerkId} AND type = 'vaccination'
      ORDER BY nextdate ASC;
    `;

    if (vaccinations.length === 0) {
      return res.status(404).json({ error: 'No vaccinations found' });
    }

    res.status(200).json(vaccinations);
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/; 
    return regex.test(dateString);
  };
  
  app.post('/api/medical/record', authenticateToken, async (req, res) => {
    const { clerkId, type, name, lastDate, nextDate } = req.body;

    if (!clerkId || !type || !name || !lastDate || !nextDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const formattedLastDate = new Date(lastDate).toISOString();
        const formattedNextDate = new Date(nextDate).toISOString();

        const newMedicalRecord = await sql`
            INSERT INTO medical_records (clerk_id, type, name, lastdate, nextdate)
            VALUES (${clerkId}, ${type}, ${name}, ${formattedLastDate}, ${formattedNextDate})
            RETURNING *;
        `;
        res.status(201).json(newMedicalRecord[0]);
    } catch (error) {
        console.error('Error adding medical record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/dogs/status', authenticateToken, async (req, res) => {
  const { clerkId, status, castrated, inHeat } = req.body;

  if (!clerkId) {
    return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
    const response = await sql`
      UPDATE dogs
      SET 
          status = COALESCE(${status}, status),
          castrated = COALESCE(${castrated}, castrated),
          in_heat = COALESCE(${inHeat}, in_heat)
      WHERE clerk_id = ${clerkId}
      RETURNING *;
    `;

    if (response.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    res.status(200).json({ success: true, data: response[0] });
  } catch (error) {
    console.error('Error updating dog status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get("/api/db-check", authenticateToken, async (req, res) => {
  try {
    const result = await sql`SELECT NOW() AS current_time;`;
    res.status(200).json({ message: "DB connection successful!", time: result[0].current_time });
  } catch (error) {
    res.status(500).json({ message: "DB connection failed", error });
  }
});

app.post('/api/walks', async (req, res) => {
  const { clerkId, date, time, latitude, longitude } = req.body;

  if (!clerkId || !date || !time || !latitude || !longitude) {
      return res.status(400).json({ error: 'Все поля обязательны' });
  }

  try {
      const newWalk = await sql`
          INSERT INTO walks (clerk_id, date, time, location_latitude, location_longitude)
          VALUES (${clerkId}, ${date}, ${time}, ${latitude}, ${longitude})
          RETURNING *;
      `;
      res.status(201).json(newWalk[0]);
  } catch (error) {
      console.error('Ошибка при создании прогулки:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
});

app.get('/api/walks', authenticateToken, async (req, res) => {
  const { clerkId } = req.query;

  if (!clerkId) {
    return res.status(400).json({ error: 'clerkId обязателен' });
  }

  try {
    const walks = await sql`
      SELECT *
      FROM walks
      WHERE clerk_id = ${clerkId}
      ORDER BY date ASC, time ASC;
    `;

    if (walks.length === 0) {
      return res.status(404).json({ error: 'Прогулки не найдены' });
    }

    res.status(200).json(walks);
  } catch (error) {
    console.error('Ошибка при получении прогулок:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/walks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { clerkId } = req.query;

  if (!id || !clerkId) {
    return res.status(400).json({ error: 'Идентификатор прогулки и clerkId обязательны' });
  }

  try {
    const walk = await sql`
      SELECT * FROM walks
      WHERE id = ${id} AND clerk_id = ${clerkId};
    `;

    if (walk.length === 0) {
      return res.status(404).json({ error: 'Прогулка не найдена или принадлежит другому пользователю' });
    }

    const result = await sql`
      DELETE FROM walks
      WHERE id = ${id} AND clerk_id = ${clerkId}
      RETURNING *;
    `;

    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Ошибка при удалении прогулки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
});
  
app.post('/api/save-token', authenticateToken, async (req, res) => {
  const { clerkId, pushToken } = req.body;

  if (!clerkId || !pushToken) {
    return res.status(400).json({ error: 'Missing clerkId or pushToken' });
  }

  try {

    await sql`
      INSERT INTO user_tokens (clerk_id, fcm_token)
      VALUES (${clerkId}, ${pushToken})
      ON CONFLICT (clerk_id)
      DO UPDATE SET fcm_token = ${pushToken};
    `;

    res.status(200).json({ success: true, message: 'Токен успешно сохранен' });
  } catch (error) {
    console.error('Ошибка сохранения Push-токена:', error);
    res.status(500).json({ error: 'Не удалось сохранить токен' });
  }
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccountKey.json")),
  });
}

app.post("/api/friends/request", authenticateToken, async (req, res) => {
  const { senderId, receiverCode } = req.body;

  if (!senderId || !receiverCode) {
    return res.status(400).json({ error: "Отправитель и код получателя обязательны" });
  }

  try {
    const receiver = await sql`
      SELECT u.name AS receiver_name, ut.fcm_token, u.clerk_id
      FROM users u
      JOIN user_tokens ut ON u.clerk_id = ut.clerk_id
      WHERE u.unique_code = ${receiverCode};
    `;

    if (receiver.length === 0) {
      return res.status(404).json({ error: "Пользователь с таким кодом не найден" });
    }

    const { receiver_name, fcm_token, clerk_id: receiverId } = receiver[0];

    const sender = await sql`
      SELECT name FROM users WHERE clerk_id = ${senderId};
    `;

    if (sender.length === 0) {
      return res.status(404).json({ error: "Отправитель не найден" });
    }

    const senderName = sender[0].name;

    const message = {
      to: fcm_token,
      sound: "default",
      title: "Запит у друзі",
      body: `${senderName} хоче додати вас у друзі`,
      data: { senderId, type: "friend_request" },
    };

    const tickets = await expo.sendPushNotificationsAsync([message]);

    await sql`
      INSERT INTO notifications (receiver_id, sender_id, title, body, created_at)
      VALUES (${receiverId}, ${senderId}, ${message.title}, ${message.body}, NOW());
    `;

    res.status(200).json({ success: true, message: "Уведомление отправлено" });
  } catch (error) {
    console.error("Ошибка отправки уведомления:", error);
    res.status(500).json({ error: "Не удалось отправить уведомление" });
  }
});

app.post('/send-notification', authenticateToken, async (req, res) => {
  const { to, title, body } = req.body;

  if (!Expo.isExpoPushToken(to)) {
      return res.status(400).json({ error: 'Invalid Expo push token' });
  }

  const messages = [{
    to: to,
    sound: 'default',
    title: title, 
    body: body,   
    data: { someData: 'goes here' },
}];

  try {
      const ticket = await expo.sendPushNotificationsAsync(messages);
      res.status(200).json({ success: true, ticket });
  } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification', details: error });
  }
});

app.get("/api/notifications", authenticateToken, async (req, res) => {
  const { receiverId } = req.query;

  if (!receiverId) {
    return res.status(400).json({ error: "Не указан receiverId" });
  }

  try {
    const notifications = await sql`
      SELECT * FROM notifications
      WHERE receiver_id = ${receiverId}
      ORDER BY created_at DESC;
    `;

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Ошибка получения уведомлений:", error);
    res.status(500).json({ error: "Не удалось получить уведомления" });
  }
});


app.post('/api/chats', authenticateToken, async (req, res) => {
  const { user1_id, user2_id } = req.body;

  if (!user1_id || !user2_id) {
    return res.status(400).json({ error: "Оба user1_id и user2_id обязательны" });
  }

  try {
    const existingChat = await sql`
      SELECT chat_id FROM chats 
      WHERE (user1_id = ${user1_id} AND user2_id = ${user2_id}) 
         OR (user1_id = ${user2_id} AND user2_id = ${user1_id});
    `;

    if (existingChat.length > 0) {
      return res.json({ chatId: existingChat[0].chat_id });
    }

    const newChat = await sql`
      INSERT INTO chats (user1_id, user2_id) 
      VALUES (${user1_id}, ${user2_id}) 
      RETURNING chat_id;
    `;

    res.json({ chatId: newChat[0].chat_id });
  } catch (error) {
    console.error("Ошибка создания чата:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

 
app.get('/api/chats/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId обязателен" });
  }

  try {
    const chats = await sql`
      SELECT chat_id, user1_id, user2_id 
      FROM chats 
      WHERE user1_id = ${userId} OR user2_id = ${userId};
    `;

    res.json(chats);
  } catch (error) {
    console.error("Ошибка получения чатов:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

 
app.post('/api/messages', authenticateToken, async (req, res) => {
  const { chat_id, sender_id, receiver_id, text } = req.body;

  if (!chat_id || !sender_id || !receiver_id || !text) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  try {
    const newMessage = await sql`
      INSERT INTO messages (chat_id, sender_id, receiver_id, text) 
      VALUES (${chat_id}, ${sender_id}, ${receiver_id}, ${text}) 
      RETURNING *;
    `;

    res.json(newMessage[0]);
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

app.get('/api/messages/:chatId', authenticateToken, async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res.status(400).json({ error: "chatId обязателен" });
  }

  try {
    const messages = await sql`
      SELECT * FROM messages 
      WHERE chat_id = ${chatId} 
      ORDER BY timestamp ASC;
    `;

    res.json(messages);
  } catch (error) {
    console.error("Ошибка получения сообщений:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});