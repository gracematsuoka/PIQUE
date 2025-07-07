<h1 align="center" display="flex" justifyContent="center">
  <a href="https://pique-i3hr9h5m6-matsuokagls-projects.vercel.app/">
    <img src="https://github.com/gracematsuoka/PIQUE/blob/main/client/src/assets/images/home/logo-banner.png?raw=true" alt="PIQUE logo" width="300">
  </a>
</h1>

<p align="center">🔗 <a href="https://pique-ten.vercel.app/">https://pique-ten.vercel.app/</a></p>
<p align="center">
  <a href="#-about-the-project">About</a> •
  <a href="#installation">Installation</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#credit">Credit</a>
</p>

<h1 align="center">
	<img src="https://github.com/gracematsuoka/PIQUE/blob/main/client/src/assets/images/home/pique_landingpage.png?raw=true" alt="Fit homepage">
</h1>


## 💡 About the Project
PIQUE is a social media and creative application for users who want to digitize their closet, share their creativity with others, or seek inspiration.

### Why build this application?
* To create a social media platform specifically for those who love fashion or want to seek styling help
* To build an application that is comprehensive and intuitive, even for users who aren't "techy"
* To challenge myself to build a full-stack project from the ground up with a hybrid architecture between a Dockerized Flask microservice for AI image processing and a MERN tech stack for the core plateform


### Tech Stack

[![My Skills](https://skillicons.dev/icons?i=react,nodejs,expressjs,mongo,firebase,js,html,scss)](https://skillicons.dev)

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Python microservice (Flask)
- Database: MongoDB
- Hosting: Vercel (frontend), Render (backend), Railway (microservice)

## 🔓 Installation

1. Clone the repository
```bash
https://github.com/gracematsuoka/PIQUE.git
```
2. Install dependencies
```bash
npm install
```
3. Create environment variables

    * `.env` in `/client`

        ```bash
        # From firebase project settings → web app config
        REACT_APP_FIREBASE_API_KEY
        REACT_APP_FIREBASE_AUTH_DOMAIN
        REACT_APP_FIREBASE_PROJECT_ID
        REACT_APP_FIREBASE_STORAGE_BUCKET
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID
        REACT_APP_FIREBASE_APP_ID
        REACT_APP_FIREBASE_MEASUREMENT_ID

        # Your backend URL (ie http://localhost:8000)
        REACT_APP_API_BASE_URL

        # From Cloudflare Images → account hash
        REACT_APP_CF_HASH
        ```
    * `.env` in `/server`

        ```bash
        # Your MongoDB cluster connection string
        MONGO_URI

        # From firebase project settings → service accounts → generate new private key
        FIREBASE_PROJECT_ID
        FIREBASE_PRIVATE_KEY_ID
        FIREBASE_PRIVATE_KEY
        FIREBASE_CLIENT_ID
        FIREBASE_CLIENT_CERT_URL

        # From Cloudflare Images → account API tokens
        CF_IMAGES_API
        CF_IMAGES_TOKEN

        # Your connection URL to the flask microservice (ie http://python:5001)
        PYTHON_SERVICE_API
        ```

4. Run the frontend

```bash
npm start
```

5. Follow the instructions for installation of Rembg at <a href="https://github.com/danielgatis/rembg">https://github.com/danielgatis/rembg</a> 

6. Make sure [Docker](https://www.docker.com/products/docker-desktop) is installed and running → run the server
    ```bash
    cd bgrem
    docker build -t rembg-server .
    docker compose build
    docker compose up
    ```


🎉 You're all set! Visit [http://localhost:3000](http://localhost:3000/closet) to get started.

## 🔑 Key Features
* Google OAuth login via Firebase for secure authentication
* AI-powered image processing microservice (Rembg)
* Protected API routes with token-based authentication and middleware handling
* Cached outfit and image to reduce backend calls and improve performance
* Interactive canvas editor for users to create outfits
* Intuitive UI design with dynamic filtering options
* Integrated Cloudflare Images for secure, performant image storage

## 📍 Roadmap 
PIQUE is an ongoing project, the following are some of the features that are being/will be implemented...
- [ ] Feed that reflects user's preferences
- [ ] AI-integrated styling feedback/recommendations
- [ ] Calender feature to plan outfits
- [ ] Messaging and commenting system to increase collaboration
- [ ] Allowing images to be uploaded in bulk

## ✅ Credit 

This project uses the following libraries/services:
* Background remover: <a href="https://github.com/danielgatis/rembg">Rembg</a>
* Loading animation: <a href="https://uiball.com/ldrs/">LDRS</a>
* Drop down selection: <a href="https://react-select.com/home">React Select</a>
* Canvas: <a href="https://fabricjs.com/">Fabric JS</a>
* Caching: [TanStack Query](https://tanstack.com/query/latest)
* Image storage: [CloudFlare Images](https://www.cloudflare.com/)
