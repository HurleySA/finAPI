const { response, request } = require("express");
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

function getBalance(statement){
    const total = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0)

    return total;
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

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) =>{
    const { amount } = request.body;
    const { user } = request;
  
    const balance = getBalance(user.statement); 
  
    if(balance < amount){
      return response.status(400).json({error:'Saldo insuficiente.'});
    }
  
    const statementOperation = {
      amount,
      created_at: new Date(),
      type: 'debit'
    }
  
    user.statement.push(statementOperation);
    return response.status(201).send();
  })

app.get("/statement/date", verifyIfExistsAccountCPF ,(request, response) => {
    const {user} = request;
    const  { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = user.statement.filter(( statement ) => statement.created_at.toDateString() 
    === new Date(dateFormat).toDateString());
    return response.json(statement);
})

app.put("/account",verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { user } = request;

    if(user) user.name = name;

    return response.status(201).send();
})

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { user } = request;

    users.splice(user,1);

    return response.status(200).json(users);
})

app.get("/balance", verifyIfExistsAccountCPF, (request, response) =>{
    const { user } = request;

    const balance = getBalance(user.statement);

    return response.json(balance);
})

app.listen(3333);