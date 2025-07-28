import { faker } from '@faker-js/faker';

export const userData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  userName: faker.internet.username(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
};

export const developerData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  userName: faker.internet.username(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
  id: faker.number.int({ min: 1, max: 1000 })
};