import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!global.firebaseAdmin) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

async function updateOrderStatus(orderId, status) {
  const orderRef = db.collection('Orders').doc(orderId);
  await orderRef.update({
    status: status,
    updatedAt: new Date().toISOString(),
    ...(status === 'success' ? { paidAt: new Date().toISOString() } : {})
  });
}

async function updateProductStock(orderId) {
  const orderRef = db.collection('Orders').doc(orderId);
  const orderDoc = await orderRef.get();
  
  if (!orderDoc.exists) return;

  const items = orderDoc.data()?.items || [];
  const batch = db.batch();

  for (const item of items) {
    const productRef = db.collection('Products').doc(item.productId);
    batch.update(productRef, {
      stock: admin.firestore.FieldValue.increment(-item.quantity)
    });
  }

  await batch.commit();
}

export async function POST(request) {
  try {
    const notification = await request.json();
    console.log('Received notification:', notification);

    const statusResponse = await snap.transaction.notification(notification);
    console.log('Status response:', statusResponse);

    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type
    } = statusResponse;

    // Update transaction record
    await db.collection('Transactions').doc(order_id).set({
      transactionId: transaction_id,
      status: transaction_status,
      paymentType: payment_type,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || transaction_status === 'settlement') {
        await updateOrderStatus(order_id, 'success');
        await updateProductStock(order_id);
        
        // Clear user's cart
        const orderDoc = await db.collection('Orders').doc(order_id).get();
        if (orderDoc.exists) {
          const userId = orderDoc.data()?.userId;
          if (userId) {
            const cartRef = db.collection('Carts').where('userId', '==', userId);
            const cartDocs = await cartRef.get();
            const batch = db.batch();
            cartDocs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }
        }
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      await updateOrderStatus(order_id, 'failed');
    }

    return NextResponse.json({ 
      status: 'OK',
      message: `Payment ${transaction_status} processed successfully`
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }, 
      { status: 500 }
    );
  }
}
