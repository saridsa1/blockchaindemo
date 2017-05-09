# Welcome to Novartis block chain initiative!

This is a sample implementation of block chain within Novartis

# Important commands

## For creating archive
composer archive create -t dir -n com.novartis.iandd

## Deploying the archive to network
composer network deploy -a com.novartis.iandd@0.0.1.bna --enrollId WebAppAdmin --enrollSecret DJY27pEnl16d

## Updating the existing archive
composer network update -a com.novartis.iandd@0.0.1.bna --enrollId WebAppAdmin --enrollSecret DJY27pEnl16d

## Starting the composer-rest-server
composer-rest-server -p defaultProfile -n com.novartis.iandd -i WebAppAdmin -s DJY27pEnl16d -N required

## Issue identities for participants
composer identity issue -n com.novartis.iandd -i WebAppAdmin -s DJY27pEnl16d -u saridsa1 -a com.novartis.iandd.Patient#PAT:0ca51aba-b159-4b0f-90f4-41051d074539

composer identity issue -n com.novartis.iandd -i WebAppAdmin -s DJY27pEnl16d -u CHETAN1 -a com.novartis.iandd.Prescriber#PRSC:8483ae1a-137e-4582-a73c-ddf4fc30916e

composer identity issue -n com.novartis.iandd -i WebAppAdmin -s DJY27pEnl16d -u STATEFARM1 -a com.novartis.iandd.Insurer#INSR:ef354f8f-ba2f-46ac-83c9-5159846b71b5
