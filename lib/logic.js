/**
 * Creating request asset by the faculty or student 
 * @param {org.blockchain.procurement.CreateRequest} createRequest
 * @transaction 
 */

function createRequest(createRequest) {
  var factory= getFactory();
  var NS='org.blockchain.procurement';
  var request= factory.newResource(NS, 'Request', createRequest.transactionId);
  request.type=createRequest.type;
  request.reqDateTime=createRequest.timestamp;
  request.quantity=createRequest.quantity;
  var fac=getCurrentParticipant();
  request.status= 'CREATED';
  request.faculty = factory.newRelationship(NS, 'Faculty', fac.getIdentifier());
  request.department= factory.newRelationship(NS, 'Department', fac.department.getIdentifier());
  
   return getAssetRegistry('org.blockchain.procurement.Request')
 .then(function(abc){
   abc.add(request);});
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

function SubmitBid(SubmitBid) {
  var factory= getFactory();
  var NS='org.blockchain.procurement';
  var tenderres= factory.newConcept(NS, 'TenderRes');
  tenderres.bid=SubmitBid.bid;
  var seller=getCurrentParticipant();
  tenderres.shop = factory.newRelationship(NS, 'Shop', seller.getIdentifier());
  tenderres.tenderresid=SubmitBid.tenderresid;
  if(SubmitBid.description) {tenderres.description=SubmitBid.description;}
  tenderres.tenderreq = factory.newRelationship(NS, 'Tenderreq', SubmitBid.trequestId);
  
  return getAssetRegistry('org.blockchain.procurement.Tenderreq')
  .then(function(abc){return abc.get(SubmitBid.trequestId);})
  .then(function (xyz){if(xyz.tenderres)
  							{xyz.tenderres.push(tenderres);
                       		 xyz.ResponseCount+=1;}                              
                       else {xyz.tenderres=[tenderres];
                             xyz.ResponseCount+=1;}
                       return getAssetRegistry('org.blockchain.procurement.Tenderreq')
                       .then(function(pqr){pqr.update(xyz);});
                       }
        );
}



