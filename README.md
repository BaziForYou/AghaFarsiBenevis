# Features
- Translate full finglish sentence to persian using behnevis api
- Support groups and super groups using command
- Can add end keyword to translate automatic
- Optimize and low usage [(around 50 ~ 60 mb ram usage)](https://cdn.discordapp.com/attachments/555420890444070912/1040091123546337280/image.png)

# Preview
##### Private Message
![image](https://cdn.discordapp.com/attachments/555420890444070912/1040088770348843068/image.png)
##### Group Test
![image](https://cdn.discordapp.com/attachments/555420890444070912/1040089105595379712/image.png)

# Requirements
- [Node JS](https://nodejs.org/)
- Telegram bot token
- Brain

## Installation	
##### Run as normal
- edit .env.exmaple and save as .env
- enter command to run
```bash
node main.js
```
##### Run on docker
- edit .env.exmaple and save as .env
- first build images using command
```bash
docker build -t ImageName .
```
- then run docker using command
```bash
docker run --restart unless-stopped ImageName
```

# Credits
- [Behnevis](https://behnevis.com)
