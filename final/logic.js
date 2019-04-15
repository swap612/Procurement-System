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
                  {return assetRegistry.get(TenderreqGenerate.requestId.getIdentifier());}
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
                    
             
                  var tenderrequest = factory.newResource(NS, 'Tenderreq',TenderreqGenerate.requestId.getIdentifier() );
                  tenderrequest.type= requestedasset.type;
                  tenderrequest.status='ACTIVE';
                  tenderrequest.ResponseCount=0;
                  tenderrequest.reqDateTime = TenderreqGenerate.timestamp;
                  tenderrequest.quantity= requestedasset.quantity;
                  tenderrequest.requestId= factory.newRelationship(NS, 'Request', TenderreqGenerate.requestId.getIdentifier() );
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
    const targettender= await assetregistry.get(SubmitBid.trequestId.getIdentifier());
	
     if(targettender.status=='COMPLETED') 
    return console.log('Contract closed');
    
    
    var factory= getFactory();		
    var NS='org.blockchain.procurement';
    var tenderress= factory.newResource(NS,'TenderRes',(targettender.getIdentifier()+seller.getIdentifier()));

    tenderress.bid=SubmitBid.bid;

    tenderress.shop = factory.newRelationship(NS, 'Shop', seller.getIdentifier());
    //tenderress.tenderresid=SubmitBid.tenderresid;
    if(SubmitBid.description) {tenderress.description=SubmitBid.description;}
    tenderress.tenderreq = factory.newRelationship(NS, 'Tenderreq', SubmitBid.trequestId.getIdentifier());
    
    const assetregistry2 =await getAssetRegistry('org.blockchain.procurement.TenderRes');
    await assetregistry2.add(tenderress);
    

    if(targettender.tenderres[0])
        {targettender.tenderres.push(tenderress);//[targettender.tenderres.length]=newRelationship(NS, 'TenderRes',targettender.getIdentifier()+seller.getIdentifier());
         targettender.ResponseCount+=1;}                              
    else {console.log(tenderress.bid);
        targettender.tenderres.push(tenderress);//newRelationship(NS, 'TenderRes',targettender.getIdentifier()+seller.getIdentifier());
    targettender.ResponseCount+=1;}

    assetregistry.update(targettender);
          
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
    let treq = await assetregistry.get(GiveContract.tenderreq.getIdentifier());
        
    if(treq.status=='COMPLETED') 
    return console.log('Already completed');
    
    let treq2= treq;
     
    var minRes =GiveContract.tenderreq.tenderres[0] ;

    if(GiveContract.Automatic==true)
    {
        for(var i=0; i<GiveContract.tenderreq.tenderres.length; i+=1)
        if(GiveContract.tenderreq.tenderres[i].bid<minRes.bid){minRes=GiveContract.tenderreq.tenderres[i];}
    }
    else
    {   
        for(var i=0; i<GiveContract.tenderreq.tenderres.length; i+=1)
        if(GiveContract.tenderreq.tenderres[i].shop.getFullyQualifiedIdentifier()==GiveContract.shopId.getFullyQualifiedIdentifier())
            {minRes=GiveContract.tenderreq.tenderres[i]; console.log('here2');
                break;}
                
    }
    
    var contract= factory.newResource(NS, 'Contract', treq.getIdentifier());
    contract.tenderresid = factory.newRelationship(NS,'TenderRes',minRes.getIdentifier());
    contract.trequestId=factory.newRelationship(NS,'Tenderreq',treq.getIdentifier().toString());
    contract.arrivalDateTime = GiveContract.timestamp;
    contract.unitPrice = minRes.bid;
    contract.totalAmount = minRes.bid * minRes.tenderreq.quantity;
    contract.shop = factory.newRelationship(NS, 'Shop', minRes.shop.getIdentifier().toString());
    contract.faculty = factory.newRelationship(NS, 'Faculty', minRes.tenderreq.requestId.faculty.getIdentifier().toString());	

    treq.status='COMPLETED';
    treq.ContractGivenTo = factory.newRelationship(NS, 'Shop', minRes.shop.getIdentifier().toString()); 
    assetregistry.update(treq);
    
    assetregistry2.add(contract); 
        
    }
  
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
  shipmentAssest.TotalAmount=ShipmentTxn.contract.totalAmount;
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
    ShipmentTxn.shipmentRcvd.contract.trequestId.requestId.status= 'COMPLETED';
    let shipreg= await getAssetRegistry('org.blockchain.procurement.Shipment');
    await shipreg.update(ShipmentTxn.shipmentRcvd);
    shipreg= await getAssetRegistry('org.blockchain.procurement.Tenderreq');
    await shipreg.update(ShipmentTxn.shipmentRcvd.contract.trequestId);
    shipreg= await getAssetRegistry('org.blockchain.procurement.Request');
    await shipreg.update(ShipmentTxn.shipmentRcvd.contract.trequestId.requestId);
  
  
  }

  
  /**
  * Setup Environment
  * @param {org.blockchain.procurement.setupEnv} setupEnv
  * @transaction 
  */
  
  async function setupEnv(setupEnv) {
    var NS='org.blockchain.procurement';
  var factory= getFactory();
  
  let idgen = factory.newResource(NS,'requestidgenerator','1');
  idgen.requestid = '1' ;
  let assetregistry = await getAssetRegistry('org.blockchain.procurement.requestidgenerator');
  await assetregistry.add(idgen); 

  
  }
