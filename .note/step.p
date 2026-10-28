1. Clone the repo without [5]
    - .next
    - .git
    - node_modules
    - bun.lock
    - package-lock.json

2. Update Logo, favicon, and package.json [5]
    - public/Logo.png 
    - src/app/favicon.ico
    - package.json
    - check build

3. Update .env.local and .env [40]
4. Update content using ai based on content.p [60]
5. deploy and do SEO [60]

-------------------------------------------------------------------------
# mongodb
- create project
- create cluster
- create user [id and password]
- copy uri and update .env.local
- go to database and user settings
    - IP Access List add [0.0.0.0]

# redis
- create database
- go to subscriptions
- Database, Endpoint [click on connect]
- Select your client [Javascript(node-redis)]
- then update 
    - username
    - password
    - host
    - port

# Gmail and password
- go to [myaccount.google.com] and search [App passwords]
- get email and generate app password 

# uploadthings
- create app 
- from api get 
    - UPLOADTHING_TOKEN, UPLOADTHING_SECRET, UPLOADTHING_ID

# google client id and secret
- Go to [https://console.cloud.google.com/]
- Create a new project or select existing one
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID" [if need project config, do it]
- Choose "Web application"
- Add authorized redirect URI: http://localhost:3000/api/auth/v1/callback/google
- Add authorized redirect URI: http://[domain.com]/api/auth/v1/callback/google
- Save your Client ID and Client Secret
- Create environment variables file and update GoogleAuthButton component:



