const express = require('express');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const { Dog, calculate_geographic_distance, match_dogs } = require('./dogMatching');
const multer = require('multer');

const path = require('path');


const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
}));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'images')); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); 
  },
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

const upload = multer({ storage });

app.use('/images', express.static(path.join(__dirname, 'images')));


const sql = neon(process.env.DATABASE_URL);

app.get("/api/test", (req, res) => {
  res.json({ message: "Локальный сервер работает!" });
});

app.post('/api/user', async (req, res) => {
  const { name, email, clerkId, gender, birthDate, breed, image, activityLevel } = req.body;
  console.log("Received data:", req.body);

  if (!name || !email || !clerkId || !gender || !birthDate || !breed || !activityLevel) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const uniqueCode = await generateUniqueCode();


      await sql`
          INSERT INTO users (name, email, clerk_id, gender, birth_date, image, unique_code)
          VALUES (${name}, ${email}, ${clerkId}, ${gender}, ${birthDate}, ${image || null}, ${uniqueCode})
          ON CONFLICT (clerk_id) DO NOTHING;
      `;

   
      const response = await sql`
          INSERT INTO dogs (clerk_id, breed, activity_level)
          VALUES (${clerkId}, ${breed}, ${activityLevel})
          RETURNING *;
      `;

      console.log("Inserted data into database:", response);
      res.status(201).json({ success: true, data: response });
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

      res.status(200).json(dogs);
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
          userDog.anti_tick
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
          dogData.anti_tick
      ));

      const matchedDogs = match_dogs(targetDog, dogs, 50);

      res.status(200).json(matchedDogs);
  } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/dog', async (req, res) => {
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
  const clerkId = req.query.clerkId;

  if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
      console.time('DB Query Time');
      const user = await sql`
      SELECT name, email, gender, birth_date, image, unique_code
      FROM users
      WHERE clerk_id = ${clerkId};
    `;
      console.timeEnd('DB Query Time');

      if (user.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user[0]);
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/user', async (req, res) => {
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

app.post('/api/upload', (req, res) => {
  const { clerkId, imageBase64 } = req.body;

  if (!clerkId || !imageBase64) {
    return res.status(400).json({ error: 'Недостаточно данных' });
  }

  sql`
    UPDATE users
    SET image = ${imageBase64}
    WHERE clerk_id = ${clerkId}
  `
    .then(() => res.status(200).json({ success: true }))
    .catch((err) => res.status(500).json({ error: 'Ошибка сохранения изображения' }));
});


app.patch('/api/user/image', upload.single('image'), async (req, res) => {
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




app.patch('/api/user/location', async (req, res) => {
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

app.get('/api/users/locations', async (req, res) => {
const { clerkId, breed, maxAge, minAge, gender } = req.query;

if (!clerkId) {
  return res.status(400).json({ error: 'clerkId is required' });
}

try {
  console.log('Фильтр породы:', breed);
  console.log('ID пользователя:', clerkId);
  console.log('Пол:', gender);
  console.log('Максимальный возраст:', maxAge);
  console.log('Минимальный возраст:', minAge);

  const userLocationQuery = await sql`
    SELECT latitude, longitude FROM user_locations WHERE clerk_id = ${clerkId};
  `;

  if (userLocationQuery.length === 0) {
    return res.status(404).json({ error: 'User location not found' });
  }

  const userLocation = userLocationQuery[0];
  const dogsQuery = await sql`
  SELECT d.breed, d.age, ul.latitude, ul.longitude, u.gender, u.name,
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
  ORDER BY distance ASC;
`;

  console.log('Результаты запроса собак:', dogsQuery);

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
app.get('/api/medical/records', async (req, res) => {
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

app.get('/api/vaccinations', async (req, res) => {
  const { clerkId } = req.query;
  console.log("Received clerkId:", clerkId); 

  if (!clerkId) {
    return res.status(400).json({ error: 'clerkId is required' });
  }

  try {
    console.log("Executing SQL query for clerkId:", clerkId);
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
  
  app.post('/api/medical/record', async (req, res) => {
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

app.get("/api/db-check", async (req, res) => {
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

app.get('/api/walks', async (req, res) => {
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

app.delete('/api/walks/:id', async (req, res) => {
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
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});