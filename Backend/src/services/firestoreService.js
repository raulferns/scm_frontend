const db = require("../config/firebase");

async function createShipment(shipmentData) {
    try {
        const docRef = await db.collection("shipments").add(shipmentData);

        await db.collection("shipments").doc(docRef.id).update({
            shipmentId: docRef.id
        });

        return {
            shipmentId: docRef.id,
            ...shipmentData
        };

    } catch (err) {
        console.error("Error creating shipment:", err);
        throw err;
    }
}


async function getAllShipments(){
    try{
        const shipments = await db.collection("shipments").get();

        if(shipments.empty){
            console.error("No shipments found");
            return [];
        }

        const shipmentList = shipments.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return shipmentList;

    }catch(err){
        console.error("Error fetching shipments:", err);
        return [];
    }
}

async function getShipmentById(shipmentId){
    try{
        const shipmentDoc = await db.collection("shipments").doc(shipmentId).get();
        if(!shipmentDoc.exists){
            console.error("Shipment not found");
            return null;
        }

        return { id: shipmentDoc.id,
            ...shipmentDoc.data(),
        };

    }catch(err){
        console.error("Error fetching shipment:", err);
        return null;
    }
}

async function updateShipment(shipmentId, updateData){
    try{
        const shipmentDoc = await db.collection("shipments").doc(shipmentId).get();
        if(!shipmentDoc.exists){
            console.error("Shipment not found");
            return null;
        }

        await db.collection("shipments").doc(shipmentId).update(updateData);
        return { id: shipmentDoc.id, ...updateData };

    }catch(err){
        console.error("Error updating shipment:", err);
        
    }
}

module.exports = {
    createShipment,
    getAllShipments,
    getShipmentById,
    updateShipment
}