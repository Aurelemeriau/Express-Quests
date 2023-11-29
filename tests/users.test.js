const request = require("supertest");
const database = require("../database")

const app = require("../src/app");

const crypto = require("node:crypto");

afterAll(() => database.end());

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async () => {
   const newUser = {
      firstname: "Jean",
      lastname: "Duardin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    expect(response.body).toHaveProperty("firstname");
    expect(typeof response.body.firstname).toBe("string");

    expect(response.body).toHaveProperty("lastname");
    expect(typeof response.body.lastname).toBe("string");

    expect(response.body).toHaveProperty("email");
    expect(typeof response.body.email).toBe("string");

    expect(response.body).toHaveProperty("city");
    expect(typeof response.body.city).toBe("string");

    expect(response.body).toHaveProperty("language");
    expect(typeof response.body.language).toBe("string");


    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(newUser.email);

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(newUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(newUser.lastname);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(newUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(newUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { lastname: "Dujardin" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });
});

describe("PUT /api/users/:id", () => {
  it("should edit user", async () => {
    const newUser = {
      firstname: "Jean",
      lastname: "Duardin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const [resultat] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [newUser.firstname, newUser.lastname, newUser.email, newUser.city, newUser.language]
    );

    const id = resultat.insertId;

    const updatedUser = {
      firstname: "Patrick",
      lastname: "Emeriau",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Cholet",
      language: "French",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(response.status).toEqual(204);

    const [result] = await database.query("SELECT * FROM users WHERE id=?", id);

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(updatedUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(updatedUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(updatedUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(updatedUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(updatedUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { lastname: "Dujardin" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });

  it("should return no user", async () => {
    const newUser = {
      firstname: "Jean",
      lastname: "Duardin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app).put("/api/users/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete user", async () => {
    const newUser = {
      firstname: "Albert",
      lastname: "Dupontel",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const [resultat] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [newUser.firstname, newUser.lastname, newUser.email, newUser.city, newUser.language]
    );

    const id = resultat.insertId;

    const response = await request(app)
    .delete(`/api/users/${id}`)

    expect(response.status).toEqual(204);

})

it("should return an error", async () => {
  const newUser = {
    firstname: "Tony",
    lastname: "Emeriau",
    email: `${crypto.randomUUID()}@wild.co`,
    city: "Angers",
    language: "French",
  };

  const response = await request(app).delete("/api/users/5000").send(newUser);  

expect(response.status).toEqual(404);

})
})
