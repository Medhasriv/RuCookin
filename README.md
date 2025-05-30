![RuCookin Logo](https://drive.google.com/uc?id=1VDDwUSAeWJqm2z3qxokwUPcFUyexgtdO)![RuCookin Logo](https://drive.google.com/file/d/1VDDwUSAeWJqm2z3qxokwUPcFUyexgtdO/view?usp=sharing)

# RUCookin

RUCookin is a cross-platform application that allows users to look up personalized recipes based on the ingredients available in their pantry, their dietary restrictions, and their cuisine preferences. Users are able to easily find and save recipes that suit their needs and make the most of the ingredients they already have in their pantry.


## Features
### User Account Features
- *Search Recipes* - Users can look up recipes and filter based on dietary preferences. Recipes will include info on the amount of time to make the recipe, the amount of servings, and the steps to make the dish.
- *Favorite Recipes* - Users can save recipes that they like so it can easily be accessed again at a later time.
- *Time-Based Recipe Suggestions* - Application will suggest recipes to the user based on the time of day that the app is opened.
- *Pantry* - Users can keep track of the ingredients they have in their pantry. Ingredients are cross-referenced with the spoonacular API. Expiration dates can be added to each ingredient for user convenience.
- *Budget-Based Meal Planning* - Recipe suggestions based on a user-inputted budget and the ingredients that the user has in their pantry.
- *Shopping Cart* - Users can add items to their grocery cart and cross check prices with their local Kroger™ store. Once users purchase items, they can clear the shopping cart list.
- *Settings* - Users can toggle notifications, choose light/dark mode, view & edit their profile, and edit their dietary preferences that they initially chose when making an account.
### Admin Account Features
- *Manage Banned Words:* Admins can manage the list of prohibited terms to keep content safe for users.
- *Analytics:* Admins can view stats on overall user engagement and preferences.
- *Accounts:* Admins can view and delete user accounts.
- *Create Recipes:* Admins can manually add new recipes into the system for users to interact with.
- *Create Admin:* Admins can create additional admin accounts.
## Tech Stack
We used a **MERN** Tech stack (MongoDB, Express.js, React Native, Node.js) for this project. MongoDB was used to efficiently and easily store data in a database. Express.js was used to simplify creation of APIs and server-side logic. React Native was used to build dynamic UI functioning on web, iOS, and Android. Node.js was used to run JS code on the server and handle backend operations. Our database is being hosted on Google Cloud, thanks to Google Cloud Run, allowing for cross platform functionality.

### System Configuration
Below is the system configuration and versions you would need to download to run the project.

**Node.js:** 22.14.0 or higher (current LTS version or higher)

**npm:** 10.9.2 or higher

**Expo Client:** 0.22.16 or higher

## Environment Variables
### Backend
To run this project, you will need to add the following environment variables to your `.env` file, which should be located in the `backend` folder. 

`MONGO_URI`=`mongodb+srv://admin001:mongoose$cooks@cluster0.u3c52.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

`PORT`=`3001`

`JWT_SECRET_KEY`=`RUCookinIntoThisSite`

`KROGER_CLIENT_ID`=`rucookin-243261243034244e376450524862484c637863582f446d525a5a6a4a2e673547763077617134776b786a3953573579343458646f6745354943744f717150625942360228422`

`KROGER_CLIENT_SECRET`=`sOWHjSfThnAaHJTT6c0PdpANX55Yr9b1m3BqMP1Z`

`KROGER_REDIRECT_URI`=`https://backend-service-612145494931.us-east1.run.app/routes/auth/krogerCallback`

### Frontend 
You will need to ensure that the following variables are included in the `/frontend/RuCookin/app.json` file on lines 53 & 54.

`"apiUrl": "https://backend-service-612145494931.us-east1.run.app",`

**Note**: If you would like to run the backend locally, please replace this link with `http://localhost:3001/`.

`"spoonacularApiKey": "9450853f0091468d9ed67e59e8df24c5" `

**Note**: The `"spoonacularApiKey"` is a free key that is limited to 150 calls per day. If you have your own spoonacular API key, please replace our key with yours here.

### Admin Login Information
We have one built-in admin account that can be accessed. Below are the credentials.

**Username:** `Admin101`\
**Password:** `SecurePass!1234`
## Installation

1. Clone the repository from github.
```bash
git clone https://github.com/Medhasriv/RuCookin.git
cd RuCookin
```
2. Set up the backend folder
```bash
cd backend
```
3. Create the `.env` file here. See [Environment Variables - backend](#Environment-Variables) for more information.
4. Install npm.
```bash
npm install
```
5. Navigate back to the RuCookin folder.
6. Open the frontend folder.
```bash
cd frontend/RUCookin
```
7. Install npm here too.
```bash
npm install
```
    
## Running the Project Locally
### Backend
If you are running the project backend locally, you must first start the backend. If you are not running the backend locally, you can skip this part.

To run the backend of the project locally, please navigate to the `/backend` folder and run `npm run dev`. It should look something like this, if it is successful:
```bash
sriyavemuri@MacBookAir RuCookin % cd backend 
sriyavemuri@MacBookAir backend % npm run dev

> backend@1.0.0 dev
> nodemon index.js

[nodemon] 3.1.9
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`
Node js server started and running on port 3001
MongoDB connected.

```

### Frontend
To run the project, please navigate to the `/frontend/RUCookin` folder and run `npx expo start -c`. It should look something like this, if it is successful:
```bash
sriyavemuri@MacBookAir RuCookin % cd frontend/RUCookin 
sriyavemuri@MacBookAir RUCookin % npx expo start -c   
Starting project at /Users/sriyavemuri/Desktop/College/Classes/CS431_SWE/RuCookin/frontend/RUCookin
Starting Metro Bundler
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▄▄ ▀ ▀█ █ ▄▄▄▄▄ █
█ █   █ ██▄▀ █ ▀▄▄█ █   █ █
█ █▄▄▄█ ██▀▄ ▄███▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█ ▀▄█ ▀▄▀ █▄▄▄▄▄▄▄█
█▄ ▀▄▄▀▄▀█▄▀█▄▀█▀ █▄█▀█▀▀▄█
█ ▀▄█▀ ▄██▄██▄▄▄▄ ▀███▄▀▀ █
█▀▀▀ ██▄ ▄▄ █▀█▄ █ ▄▀▀█▀ ██
█ ▄▀▀▄▀▄▄█ ▄█▀▄▀ ▄▀ ██▄▀  █
█▄█▄▄▄▄▄█ ▀▀ ▄▄ █ ▄▄▄  ▄▀▄█
█ ▄▄▄▄▄ ██▀█▀▄  █ █▄█ ███ █
█ █   █ █  █▄ ▀█▄ ▄  ▄ █▀▀█
█ █▄▄▄█ █▀   ▀█▄ ▄█▀▀▄█   █
█▄▄▄▄▄▄▄█▄██▄██▄▄▄▄█▄▄███▄█

› Metro waiting on exp://192.168.1.101:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Web is waiting on http://localhost:8081

› Using Expo Go
› Press s │ switch to development build

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› shift+m │ more tools
› Press o │ open project code in your editor

› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to exit.

```

If you would like to run the program on your personal device, please make sure the **Expo Go** app is downloaded, and then scan the QR code.\
To run the application on web, press `w`.\
To run the application on an iOS simulator (so iPhone and iPad), press `i`.\
To run the application on an Android simulator, press `a`.\
*Note*: you may have to start the iOS and Android simulator separately on a different terminal window before you do this.


## Demo
[Watch the demo video here](https://youtu.be/o1wv6IYIVzU)

## Authors

- [@Medhasriv](https://github.com/Medhasriv)
- [@Dhruvita-P](https://github.com/Dhruvita-P)
- [@rlxchehab](https://github.com/rlxchehab)
- [@sriyavemuri](https://github.com/sriyavemuri)

## Acknowledgements
- Spoonacular® Recipe & Food API for the bulk of our nutrition data. You can check out there [Github here.](https://github.com/ddsky/spoonacular-api-clients).
- Kroger™ Developer API for live grocery-price look-ups (Kroger is a registered trademark of The Kroger Co.).  
- Google Cloud Run for generous free trial credits that let us deploy the backend for free.  
- React Native + Expo, Express.js, and MongoDB Atlas for the open-source stack that made full-stack development painless.  
- Prof. Lily Chang and the Spring 2025 CS 431 Software Engineering class at Rutgers for feedback and guidance during the design and implementation of the application during biweekly sprints.
- Icons made by Freepik, Darwisy Alfarizi, alkhalifi, kosonicon, Phoenix Group, Tanah Basah from www.flaticon.com
- Photos by Mike Gattorn, S'well, Metin Ozer, nrd on Unsplash

All product names, logos, and brands are property of their respective owners and are used for identification purposes only.

