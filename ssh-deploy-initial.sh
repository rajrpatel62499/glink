#!/bin/sh
# Anka-Backend - original
# chmod 400 modapps-anka.pem
# ssh -i "modapps-anka.pem" ubuntu@ec2-54-172-159-187.compute-1.amazonaws.com

# Fuse - montreal
# git clone https://modapps-info-admin@bitbucket.org/modapps-anka/anka-fuse-v0.git
# chmod 400 montreal-key-pair.pem
# ssh -i "montreal-key-pair.pem" ubuntu@ec2-35-182-216-239.ca-central-1.compute.amazonaws.com

echo "*****************************************"
echo "Prerequisites: Clone the repository first"
echo "*****************************************"
ls
cd anka-fuse-v0
# rm -rf *
echo "sStfsNXFAhY6MW3dJZts"
git pull
git log --name-status HEAD^..HEAD
# sudo git clone https://modapps-info-admin@bitbucket.org/modapps-anka/anka-fuse-v0.git
sudo npm install -g node-gyp
sudo npm install bcrypt
sudo npm i
sudo npm i --only=dev
npm run build
pm2 status
pm2 kill
pm2 start npm --name "anka-prod " -- start


