const capitalize = (str) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

export const fetchDogBreeds = async () => {
try {
const response = await fetch('https://dog.ceo/api/breeds/list/all');
const data = await response.json();

if (data.status === 'success') {
  return Object.keys(data.message).map(breed => capitalize(breed));
} else {
  console.error('Ошибка при получении списка пород:', data);
  return [];
}
} catch (error) {
console.error('Ошибка при запросе к Dog CEO API:', error);
return [];
}
};
