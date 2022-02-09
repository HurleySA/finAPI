const { response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json())

const users = [];

//Middleware
function verifyIfExistsAccountCPF(request, response, next){
    const { cpf } = request.headers;

    const user = users.find((user) => user.cpf === cpf);

    if(!user) return response.status(400).json({ error: "Usuário não encontrado."})

    request.user = user;

    return next();
}

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

app.get("/statement", verifyIfExistsAccountCPF ,(request, response) => {
    const {user} = request;
    return response.json(user.statement);
})

app.post("/deposit", verifyIfExistsAccountCPF, (request,response) => {
    const { user } = request;
    const { description, amount } = request.body;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit',
    }

    user.statement.push(statementOperation);

    return response.status(201).send();

})

app.listen(3333);