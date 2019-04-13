/**
 * Creating request asset by the faculty or student 
 * @param {org.blockchain.procurement.CreateRequest} createRequest
 * @transaction 
 */

function createRequest(createRequest) {
    var factory= getFactory();
    var NS='org.blockchain.procurement';
      
      return getAssetRegistry('org.blockchain.procurement.requestidgenerator')
      .then(function(reqidgenreg){return reqidgenreg.get('1');})
      .then(function(reqidgen){	
        
                        var request= factory.newResource(NS, 'Request', reqidgen.requestid);
  
                        var num=parseInt(reqidgen.requestid);
                        num+=1;
                        reqidgen.requestid=num.toString();
  
  
                        request.type=createRequest.type;
                        request.reqDateTime=createRequest.timestamp;
                        request.quantity=createRequest.quantity;
                          request.status= 'CREATED';
                        var fac=getCurrentParticipant();
                        request.faculty = factory.newRelationship(NS, 'Faculty', fac.getIdentifier());
  
                        return getAssetRegistry('org.blockchain.procurement.requestidgenerator')
                        .then(function(reqidgenreg2){return reqidgenreg2.update(reqidgen);})
                        .then(function(){return getAssetRegistry('org.blockchain.procurement.Request');})
                            .then(function(abc){abc.add(request);});
      });
  
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
  
  function GiveContract(GiveContract) {
    var factory= getFactory();
    var NS='org.blockchain.procurement';
  
    return getAssetRegistry('org.blockchain.procurement.Tenderreq')
    .then(function(assetregistry){return assetregistry.get(GiveContract.trequestId);})
    .then(function(treq){treq.tenderres.sort(function(a,b){return (a.bid - b.bid );}); 
                         return treq;})
    .then(  function(treq){var minRes = treq.tenderres[0] ;
                         var contract= factory.newResource(NS, 'Contract', GiveContract.trequestId);
                         
                         
                         contract.tenderresid = minRes.tenderresid;
                         contract.arrivalDateTime = GiveContract.timestamp;
                         contract.unitPrice = minRes.bid;
                         contract.totalAmount = minRes.bid * minRes.tenderreq.quantity;
                         contract.shop = factory.newRelationship(NS, 'Shop', minRes.shop.email);
                         contract.trequestId = factory.newRelationship(NS, 'Tenderreq', minRes.tenderreq.trequestId);
                         contract.faculty = factory.newRelationship(NS, 'Faculty', minRes.tenderreq.requestId.faculty.email);
                         
                                   return getAssetRegistry('org.blockchain.procurement.Contract').then(function(contr){contr.add(contract);});
        
    });
  
   
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
  }