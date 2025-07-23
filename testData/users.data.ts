import { faker } from '@faker-js/faker';

export const userData = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  userName: faker.internet.username(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
};