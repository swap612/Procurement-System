# procurement
Procurement System for college

System Configuration:
OS: Linux
Blockchain: Hyperledger 

I. Steps to setup:
1> Starting the Hyperledger fabric :
	  i. ./stopFabric.sh
	 ii. ./startFabric.sh
	iii. ./createPeerAdminCard.sh

2> Creating Business Network Archive  
  	$npm install
	Output file: ./dist/procurement.bna

3> Install bussiness network
	$cd dist
	$composer network install --archiveFile procurement.bna --card PeerAdmin@hlfv1
	
4 > Start the bussiness network => card is generated  
	$composer network start --networkName procurement --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file procurement.card  

5> 	Import the card
	$composer card import --file procurement.card
	
5>  Check that network is up and running by typing:  
	$composer network ping --card admin@procurement

6> 	Testing the Bussiness network
	$composer-playground

II. Steps to create the different identities of the network
1> In composer playground, create the Participants(1 department, faculty and traders).
2> Generate identity corresponding to each participant from ID Registry, it will generate cards corresponding to each participant.
3> Goto Test tab and click Submit Transaction and call setupEnv.

III. Steps to generate the Angular GUI for each participant
1> Goto project folder, type command
	$yo
	Then enter the details like project name, card name(for each participant), rest server port, etc.
	It will generate a folder project_name, update the port number(--port 4202 ) in package.json file. Assign different port to each participant.
	Modify Line 20: "start": "concurrently \"ng serve --proxy-config proxy.conf.js --host 0.0.0.0 --port 4202 \" \"npm run api\"".
	To see all the entries in Angular GUI. Modify the ./src/app/app.component.css file
	In the last property .scrollable-menu update max-height to 500px. 
2> run $npm start
3> Open the link: http://localhost:4202/ to see the GUI.

IV. Steps to test the Application
1> Faculty will run the CreateRequest transaction to place an request.
2> Department will run the TenderreqGenerate transaction to validate and create tender request for all traders.
3> Each trader will submit the bid by runninng SubmitBid transaction.
4> Department will run the GiveContact where it will ask the shopId to explicitly give the contract or else if Automatic option is set true, it will automatically select the minimum bid.
5> Winner Trader now call the ShipmentTransaction to ship the product. 
6> In Last faculty will run ShipmentReceived transaction to acknowledge the delivery.

NOTE: For request, tenderreq and shop ID enter the complete reference like "resource:org.blockchain.procurement.Shop#ID"

