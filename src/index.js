const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json())

const users = [];

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const userAlreadyExists = users.some((user) => user.cpf === cpf);

    if(userAlreadyExists) return response.status(400).send("Usuário já cadastrado.");

    const newUser = {
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    }

    users.push(newUser);
    return response.status(201).send();
})

app.get("/accounts", (request, response) => {
    return response.status(201).send(users);
})

app.listen(3333);