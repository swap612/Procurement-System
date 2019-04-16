# procurement

&#34;Procurement System for college&#34;


1> Creating Business Network Archive  
  **npm install**

Looking for package.json of Business Network Definition  
	Input directory: /home/swapnil/CS731/Project/procurement

Found:
	Description: &#34;Procurement System for college&#34;
	Name: procurement
	Identifier: procurement@0.0.1

Written Business Network Definition Archive file to 
	Output file: ./dist/procurement.bna

2> Install bussiness network  
**composer network install --archiveFile procurement.bna --card PeerAdmin@hlfv1**


3 > Create the bussiness network => card is generated  
 **composer network start --networkName procurement --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file procurement.card**  

4> **composer card import --file procurement.card**

Successfully imported business network card
	Card file: procurement.card
	Card name: admin@procurement

5> confirm that network is up and running by typing:  
**composer network ping --card admin@procurement**

The connection to the network was successfully tested: procurement
	Business network version: 0.0.1
	Composer runtime version: 0.20.8
	participant: org.hyperledger.composer.system.NetworkAdmin#admin
	identity: org.hyperledger.composer.system.Identity#299f57ca0dfbf99d2366a4f58190f5c291070802276813b4b6b0fd0f2afa58c2

6> Testing the Bussiness network
**composer-playground**


7> REST-API  
**composer-rest-server**
 
