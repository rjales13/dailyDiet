<h1 align="center">
<br>
Daily Diet API
</h1>

<p align="center">The Daily Diet API allows users to organize their diet by creating meal plans. This API is built with Node.js | Fastify | Knex | Typescript, and it uses SQlite as the database for storing user data. There's also an End-to-End testing using Vitest</p>

<hr />

## Features
- **NODEJS**
- **FASTIFY**
- **KNEX**
- **TYPESCRIPT**
- **SQLITE**
- **VITEST**

## Getting started

- run the command: npm i
- run the command: npm run dev

## API Endoints

- List All Users => GET http://localhost:3333/users
- List a User => GET http://localhost:3333/users/USERID
- Create Meal by User => POST http://localhost:3333/meals
    - Body example:
    {
        "name": "Lunch",
        "description": "Rice, beans and egg",
        "onDiet": true
    }
- List all Meals of a User => GET http://localhost:3333/meals/list/
- List a Meal => GET http://localhost:3333/meals/MEALID
- Edit a Meal => PUT http://localhost:3333/meals/MEALID
    - Body example:
        {
            "onDiet": true
        }
- Delete a Meal => DELETE http://localhost:3333/meals/MEALID
- List the Metrics of a User having Meals => GET http://localhost:3333/meals/metrics/


## NOTES
This app is just the backend part!