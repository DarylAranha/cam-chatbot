const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello world')
})

// get user request
app.post('/fetch', (req, res) => {
    // Step 1: extract the dish info from body
    const queryRequest = req.body.queryResult;
    const dish = queryRequest.parameters.DishEntity;
    const fulfillmentResponse = {
        "fulfillmentMessages": [
          {
            "text": {
              "text": []
            }
          }
        ]
    }
    
    // Step 2: call 3rd party api to get the ingredient
    axios({
        method: 'get',
        url: `https://www.themealdb.com/api/json/v1/1/search.php?s=${dish}`,
    })
    .then(response => {
        const meals = response.data.meals;
        if (!meals) {
            fulfillmentResponse['fulfillmentMessages'][0]['text']['text'] = ["No Meals in the database."];
            return res.json(fulfillmentResponse);
        }

        const dish = {}
        meals.forEach(ele => {
            const ingredients = []
            let i = 1;
            while(ele['strIngredient' + i]) {
                ingredients.push(ele['strIngredient' + i++]);
            }

            dish[ele.strMeal] = ingredients;
        })

        // Step 3: format the response as per google dialog flow
        const ingredients = dish[Object.keys(dish)[0]].join(', ');
        fulfillmentResponse['fulfillmentMessages'][0]['text']['text'] = ["You need: " + ingredients];
        res.json(fulfillmentResponse)
    })
    .catch(error => {
        console.log(error);
        
        fulfillmentResponse['fulfillmentMessages'][0]['text']['text'] = ["No Meals in the database."];
        res.json(fulfillmentResponse);
    })
})

app.listen(port, () => {
    console.log('Server is running on port 3000');
})