import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../axios"; // Use configured axios instance
import AppContext from "../../Context/Context";
import unplugged from "../../assets/unplugged.png";

const Home = ({ selectedCategory }) => {
  const { data, isError, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    if (data && data.length > 0) {
      console.log("Data received:", data);
      setIsLoadingImages(true);
      setImagesLoaded(false);
      
      // Initialize products with no imageUrl first
      setProducts(data.map(product => ({ ...product, imageUrl: null })));
      
      // Fetch images and update products
      const fetchImagesAndSetProducts = async () => {
        console.log("Starting to fetch images for", data.length, "products");
        
        // Create a map to store image URLs
        const imageMap = new Map();
        
        // Fetch all images in parallel
        const imagePromises = data.map(async (product) => {
          try {
            console.log("Fetching image for product:", product.id);
            const response = await API.get(
              `/product/${product.id}/image`,
              { responseType: "blob" }
            );
            
            if (response.data) {
              const imageUrl = URL.createObjectURL(response.data);
              console.log("Image loaded for product:", product.id);
              imageMap.set(product.id, imageUrl);
            } else {
              console.log("No image data for product:", product.id);
              imageMap.set(product.id, unplugged);
            }
          } catch (error) {
            console.error("Error fetching image for product ID:", product.id, error);
            imageMap.set(product.id, unplugged);
          }
        });
        
        // Wait for all images to load
        await Promise.all(imagePromises);
        
        // Update products with loaded images
        const updatedProducts = data.map(product => ({
          ...product,
          imageUrl: imageMap.get(product.id)
        }));
        
        console.log("All images processed, setting products");
        setProducts(updatedProducts);
        setIsLoadingImages(false);
        setImagesLoaded(true);
      };

      fetchImagesAndSetProducts();
    }
  }, [data]);

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  // Clear category filter - this will be handled by the parent component
  const clearCategoryFilter = () => {
    window.location.reload();
  };


  if (isError) {
    return (
      <h2 className="text-center" style={{ padding: "18rem" }}>
        <img src={unplugged} alt="Error" style={{ width: '100px', height: '100px' }}/>
      </h2>
    );
  }

  if (!data || data.length === 0 || isLoadingImages || !imagesLoaded) {
    return (
      <div className="text-center" style={{ padding: "18rem" }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mt-3">Loading products...</h4>
      </div>
    );
  }

  return (
    <>
      {/* Category Filter Header - Simplified */}
      {selectedCategory && (
        <div className="category-filter-header-simple" style={{ 
          marginTop: "80px", 
          padding: "10px 20px",
          textAlign: "center"
        }}>
          <span className="badge bg-primary me-2">
            <i className="bi bi-funnel me-1"></i>
            {selectedCategory}
          </span>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={clearCategoryFilter}
          >
            <i className="bi bi-x-circle me-1"></i>
            Clear Filter
          </button>
        </div>
      )}
      
      <div className="grid" style={{ marginTop: selectedCategory ? "20px" : "64px", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", padding: "20px" }}>
        {filteredProducts.length === 0 ? (
          <h2
            className="text-center"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No Products Available
          </h2>
        ) : (
          filteredProducts.map((product) => {
            const { id, brand, name, price, productAvailable, imageUrl } = product;
            
            // Debug: Log the first product to console
            if (id === 11) {
              console.log("Product ID 11 data:", { id, name, brand, price });
            }

            return (
              <div className={`card mb-3 product-card`} style={{ backgroundColor: productAvailable ? "#fff" : "#ccc" }} key={id}>
                <Link
                  to={`/product/${id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="product-img-wrapper">
                    <img
                      src={imageUrl}
                      alt={name || brand}
                      className="product-img"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="card-body card-body-flex">
                    <p className="card-brand" style={{ marginBottom: '5px' }}>
                      <i className="bi bi-tag-fill me-1"></i>
                      {brand}
                    </p>
                    <div className="product-name-text" style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600',
                      marginBottom: '8px',
                      marginTop: '5px',
                      lineHeight: '1.4'
                    }}>
                      {name || brand}
                    </div>
                    <div className="product-price-badge">
                      <span className="price-label">Rs {price}</span>
                    </div>
                    {!productAvailable && (
                      <div className="out-of-stock-badge">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        Out of Stock
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Home;