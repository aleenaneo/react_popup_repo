import React, { useState, useEffect } from 'react';
import { generateFullCartUrlWithAttributes } from '../../utils/helpers';
import { fetchRelatedProductsBySku } from '../../api/graphqlService';
import { getInitialData } from '../../api/apiConfig';

const CartUrlExample = () => {
  // State for product ID
  const [productId, setProductId] = useState(219); // Default to 219 if no related products found
  
  // Example data
  const exampleVehicle = {
    year: '2003',
    make: 'Toyota',
    model: 'Camry'
  };
  
  const exampleAppointment = {
    date: '2024-06-15',
    time: 'Morning'
  };
  
  const exampleLocation = {
    member_id: '12345'
  };
  
  const exampleZipcode = '2024';
  
  // Create attribute mapping
  const attributeMapping = createAttributeMapping(exampleVehicle, exampleAppointment, exampleLocation, exampleZipcode);
  
  // Fetch related products and use the first one's entity ID
  useEffect(() => {
    const fetchRelatedProduct = async () => {
      try {
        const initialData = getInitialData();
        const productSku = initialData.product_sku;
        
        if (productSku) {
          const relatedProducts = await fetchRelatedProductsBySku(productSku);
          
          if (relatedProducts && relatedProducts.length > 0) {
            // Use the entity ID of the first related product
            setProductId(relatedProducts[0].entityId);
            console.log('Using related product entity ID:', relatedProducts[0].entityId);
          } else {
            console.log('No related products found, using default ID 219');
          }
        } else {
          console.log('No product SKU found in initial data, using default ID 219');
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        // Keep default ID if there's an error
      }
    };
    
    fetchRelatedProduct();
  }, []);
  
  // Generate cart URL
  const cartUrl = generateFullCartUrlWithAttributes(productId, attributeMapping);
  
  return (
    <div className="cart-url-example">
      <h3>Cart URL Example</h3>
      <p><strong>Entity ID to Display Name Mapping:</strong></p>
      <ul>
        <li>375: vehicle year</li>
        <li>376: vehicle make</li>
        <li>377: vehicle modal</li>
        <li>381: installation date</li>
        <li>382: time</li>
        <li>383: notes</li>
        <li>384: installer member id</li>
        <li>385: zip code</li>
      </ul>
      
      <p><strong>Selected Values:</strong></p>
      <ul>
        <li>Vehicle Year: {exampleVehicle.year}</li>
        <li>Vehicle Make: {exampleVehicle.make}</li>
        <li>Vehicle Model: {exampleVehicle.model}</li>
        <li>Installation Date: {exampleAppointment.date}</li>
        <li>Time: {exampleAppointment.time}</li>
        <li>Installer Member ID: {exampleLocation.member_id}</li>
        <li>Zip Code: {exampleZipcode}</li>
      </ul>
      
      <p><strong>Generated Cart URL:</strong></p>
      <code>{cartUrl}</code>
      
      <p><strong>Decoded URL Parameters:</strong></p>
      <ul>
        <li>action: add</li>
        <li>product_id: {productId}</li>
        <li>attribute[375]: {exampleVehicle.year}</li>
        <li>attribute[376]: {exampleVehicle.make}</li>
        <li>attribute[377]: {exampleVehicle.model}</li>
        <li>attribute[381]: {exampleAppointment.date}</li>
        <li>attribute[382]: {exampleAppointment.time}</li>
        <li>attribute[383]: (empty)</li>
        <li>attribute[384]: {exampleLocation.member_id}</li>
        <li>attribute[385]: {exampleZipcode}</li>
      </ul>
    </div>
  );
};

export default CartUrlExample;