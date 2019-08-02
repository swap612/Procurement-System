/**
 * Creating request asset by the faculty or student 
 * @param {org.blockchain.procurement.CreateRequest} createRequest
 * @transaction 
 */

async function createRequest(createRequest) {
  var factory= getFactory();
  var NS='org.blockchain.procurement';
    
    const reqidgenreg= await getAssetRegistry('org.blockchain.procurement.requestidgenerator');
    let reqidgen = await reqidgenreg.get('1');
    
    var request= factory.newResource(NS, 'Request', reqidgen.requestid);

    var num=parseInt(reqidgen.requestid);
    num+=1;
    reqidgen.requestid=num.toString();
	await reqidgenreg.update(reqidgen);

    request.type=createRequest.type;
    request.reqDateTime=createRequest.timestamp;
    request.quantity=createRequest.quantity;
    request.status= 'CREATED';
    var fac=getCurrentParticipant();
    request.faculty = factory.newRelationship(NS, 'Faculty', fac.getIdentifier());

    const abc= await getAssetRegistry('org.blockchain.procurement.Request');
    await abc.add(request);

}

/**
* Generating tender request by the procurement department 
* @param {org.blockchain.procurement.TenderreqGenerate} TenderreqGenerate 
* @transaction 
*/

function TenderreqGenerate(TenderreqGenerate) {
  var factory= getFactory();
  var NS='org.blockchain.procurement';
 
  return getAssetRegistry('org.blockchain.procurement.Request')
  .then(function (assetRegistry)
                {return assetRegistry.get(TenderreqGenerate.requestId);}
       )
  .then(function (requestedasset)
          {
            if(requestedasset.quantity>100 || requestedasset.quantity<1) 
                { 
                requestedasset.status='DENIED';
                return getAssetRegistry('org.blockchain.procurement.Request').
                then(function(xyz){return xyz.update(requestedasset);});
                }
            else{ 
                requestedasset.status='APPROVED';
              	
           
                var tenderrequest = factory.newResource(NS, 'Tenderreq',TenderreqGenerate.requestId );
                tenderrequest.type= requestedasset.type;
                tenderrequest.status='ACTIVE';
              	tenderrequest.ResponseCount=0;
                tenderrequest.reqDateTime = TenderreqGenerate.timestamp;
                tenderrequest.quantity= requestedasset.quantity;
                tenderrequest.requestId= factory.newRelationship(NS, 'Request', TenderreqGenerate.requestId );
                tenderrequest.tenderres=[];
                return getAssetRegistry('org.blockchain.procurement.Request')
                .then(function(abc){abc.update(requestedasset);})
                .then(function (){
              	return getAssetRegistry('org.blockchain.procurement.Tenderreq');})
                .then(function(xyz){return xyz.add(tenderrequest);}); 
                }
            }
        );  
}



/**
 * Creating request asset by the faculty or student 
 * @param {org.blockchain.procurement.SubmitBid}  SubmitBid
 * @transaction 
 */

async function SubmitBid(SubmitBid) {
  var seller=getCurrentParticipant();
 
  const assetregistry = await getAssetRegistry('org.blockchain.procurement.Tenderreq'); // to check if a person has already placed a bid, if yes return back
  const targettender= await assetregistry.get(SubmitBid.trequestId);
  if(targettender.tenderres.some(function(el){return (el.shop.getIdentifier() === seller.getIdentifier());})) 
        {console.log('You have put bid already'); return;}
  
  var factory= getFactory();		// if not placed, then place the bid for the first time
  var NS='org.blockchain.procurement';
  var tenderress= factory.newConcept(NS, 'TenderRes');
  tenderress.bid=SubmitBid.bid;
  tenderress.shop = factory.newRelationship(NS, 'Shop', seller.getIdentifier());
  tenderress.tenderresid=SubmitBid.tenderresid;
  if(SubmitBid.description) {tenderress.description=SubmitBid.description;}
  tenderress.tenderreq = factory.newRelationship(NS, 'Tenderreq', SubmitBid.trequestId);
  
  return getAssetRegistry('org.blockchain.procurement.Tenderreq')
  .then(function(abc){return abc.get(SubmitBid.trequestId);})
  .then(function (xyz){if(xyz.tenderres)
  							{xyz.tenderres.push(tenderress);
                       		 xyz.ResponseCount+=1;}                              
                       else {xyz.tenderres=[tenderress];
                             xyz.ResponseCount+=1;}
                       return getAssetRegistry('org.blockchain.procurement.Tenderreq')
                       .then(function(pqr){pqr.update(xyz);});
                       }
        );
}

/**
 * Creating request asset by the faculty or student 
 * @param {org.blockchain.procurement.GiveContract} GiveContract
 * @transaction 
 */

  async function GiveContract(GiveContract) {
  var factory= getFactory();
  var NS='org.blockchain.procurement';

  const assetregistry= await getAssetRegistry('org.blockchain.procurement.Tenderreq');
  const assetregistry2 = await getAssetRegistry('org.blockchain.procurement.Contract');
  const assetregistry3= await getAssetRegistry('org.blockchain.procurement.Request');
  
  let treq = await assetregistry.get(GiveContract.tenderreq.getIdentifier());
  
 
  let treq2= treq;
  //treq2.tenderres.sort(function(a,b){return (a.bid - b.bid );}); 
  var minRes = treq2.tenderres[0] ;
   
    
  var contract= factory.newResource(NS, 'Contract', GiveContract.tenderreq.getIdentifier());
  contract.tenderresid = minRes.tenderresid;
  contract.arrivalDateTime = GiveContract.timestamp;
  contract.unitPrice = minRes.bid;
    
   let temp= minRes.tenderreq;
   console.log(temp);
    
    
  /*  
   let temp4 =await assetregistry3.get(temp.requestId);
    
    
    
   let temp2= temp4.faculty;
    let temp3= minRes.shop;
    
  contract.totalAmount = minRes.bid * temp.quantity;
  contract.shop = factory.newRelationship(NS, 'Shop', temp3.getIdentifier());
  contract.trequestId = factory.newRelationship(NS, 'Tenderreq', temp.trequestId);
  contract.faculty = factory.newRelationship(NS, 'Faculty', temp2.getIdentifier());	
  treq.status='COMPLETED';
  //treq.ContractGivenTo = factory.newRelationship(NS, 'Shop', temp3.getIdentifier()); 
  assetregistry.update(treq);
  
  assetregistry2.add(contract); 
    */  
  }

 
//  var minRes = treq.tenderres[0] ;

//  var contract= factory.newResource(NS, 'Contract', GiveContract.trequestId);
//  contract.tenderresid = minRes.tenderresid;
//  contract.arrivalDateTime = GiveContract.timestamp;
//  contract.unitPrice = minRes.bid;
//  contract.totalAmount = minRes.bid * minRes.tenderreq.quantity;

//  contract.shop = factory.newRelationship(NS, 'Shop', minRes.shop.email);
//  contract.faculty = factory.newRelationship(NS, 'Faculty', minRes.tenderreq.requestId.faculty.email);
//  contract.trequestId = factory.newRelationship(NS, 'Tenderreq', minRes.tenderreq.trequestId);

//   const contr = await getAssetRegistry('org.blockchain.procurement.Contract');
//   await contr.add(contract); */

  /*
 var mRes = treq.tenderres[0];    //.find(x => x.shop.getIdentifier()== GiveContract.shopId);

 var contract= factory.newResource(NS, 'Contract', GiveContract.trequestId);
 contract.tenderresid = mRes.tenderresid;
 contract.arrivalDateTime = GiveContract.timestamp;
 contract.unitPrice = mRes.bid;
 contract.totalAmount = mRes.bid * mRes.tenderreq.quantity;

 contract.shop = factory.newRelationship(NS, 'Shop', mRes.shop.email);
 contract.faculty = factory.newRelationship(NS, 'Faculty', mRes.tenderreq.requestId.faculty.email);
 contract.trequestId = factory.newRelationship(NS, 'Tenderreq', mRes.tenderreq.trequestId);

  const contr = await getAssetRegistry('org.blockchain.procurement.Contract');
  await contr.add(contract); 
  */


/**
* Creating ShipmentTransaction
* @param {org.blockchain.procurement.ShipmentTransaction} ShipmentTxn
* @transaction 
*/


function ShipmentTransaction(ShipmentTxn) {
var NS='org.blockchain.procurement';
var factory= getFactory();

let shipmentAssest = factory.newResource(NS,'Shipment',ShipmentTxn.shipmentId);

// shipmentAssest.shipmentId = ShipmentTxn.shipmentId;
shipmentAssest.type = ShipmentTxn.contract.trequestId.type ;  //Add from contract
shipmentAssest.unitCount = ShipmentTxn.contract.trequestId.quantity ;  //Add from contract
shipmentAssest.contract = ShipmentTxn.contract;
shipmentAssest.status = 'IN_TRANSIT' ;
shipmentAssest.address = ShipmentTxn.contract.faculty.address;

  return getAssetRegistry('org.blockchain.procurement.Shipment').then(
  function(assestRegistry){
    assestRegistry.add(shipmentAssest);
  });
}


/**
* Shipment Received
* @param {org.blockchain.procurement.ShipmentRecieved} ShipmentTxn
* @transaction 
*/

async function ShipmentRecieved(ShipmentTxn) {
  // var NS='org.blockchain.procurement';

  ShipmentTxn.shipmentRcvd.status = 'ARRIVED' ; 
  ShipmentTxn.shipmentRcvd.contract.trequestId.status = 'COMPLETED';  
  ShipmentTxn.shipmentRcvd.contract.trequestId.requestId.status= 'COMPLETED'
  let shipreg= await getAssetRegistry('org.blockchain.procurement.Shipment');
  await shipreg.update(ShipmentTxn.shipmentRcvd);
  shipreg= await getAssetRegistry('org.blockchain.procurement.Tenderreq');
  await shipreg.update(ShipmentTxn.shipmentRcvd.contract.trequestId);
  shipreg= await getAssetRegistry('org.blockchain.procurement.Request');
  await shipreg.update(ShipmentTxn.shipmentRcvd.contract.trequestId.requestId);


}


/**
* SetUp Environment
* @param {org.blockchain.procurement.setupEnv} env
* @transaction 
*/

async function setupEnv(env) {
     var NS='org.blockchain.procurement';
     var factory= getFactory();
    /* let DeptAssest = factory.newResource(NS,'Department','101');
     DeptAssest.name = 'PROCUREMENT' ;
     DeptAssest.address.city='MUMBAI';
     DeptAssest.address.zip='410101';
  	const dept= await getAssetRegistry('org.blockchain.procurement.Department');
    await dept.add(DeptAssest);
  */
  
   let FacAssest = factory.newResource(NS,'Faculty','2000');
     FacAssest.name = 'Sandeep Shukla' ;
  
      var addrConcept = factory.newConcept('org.blockchain.procurement.Faculty', 'address');
     //addrConcept.city='KANPUR';
    // addrConcept.zip='200101';
  	FacAssest.Address = addrConcept ;
  
  const fac= await getAssetRegistry('org.blockchain.procurement.Faculty');
    await fac.add(FacAssest);
  /*
  let ShopAssest = factory.newResource(NS,'Shop','2000');
     ShopAssest.name = 'LALA Traders' ;
     ShopAssest.address.city='LUCKNOW';
     ShopAssest.address.zip='208101';

  const shop = await getAssetRegistry('org.blockchain.procurement.Shop');
    await shop.add(ShopAssest);*/
  

}

