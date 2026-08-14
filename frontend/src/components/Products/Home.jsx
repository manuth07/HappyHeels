import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../axios";
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
      setIsLoadingImages(true);
      setImagesLoaded(false);
      
      setProducts(data.map(product => ({ ...product, imageUrl: null })));
      
      const fetchImagesAndSetProducts = async () => {
        const imageMap = new Map();
        
        const imagePromises = data.map(async (product) => {
          try {
            const response = await API.get(
              `/product/${product.id}/image`,
              { responseType: "blob" }
            );
            
            if (response.data) {
              const imageUrl = URL.createObjectURL(response.data);
              imageMap.set(product.id, imageUrl);
            } else {
              imageMap.set(product.id, unplugged);
            }
          } catch (error) {
            imageMap.set(product.id, unplugged);
          }
        });
        
        await Promise.all(imagePromises);
        
        const updatedProducts = data.map(product => ({
          ...product,
          imageUrl: imageMap.get(product.id)
        }));
        
        setProducts(updatedProducts);
        setIsLoadingImages(false);
        setImagesLoaded(true);
      };

      fetchImagesAndSetProducts();
    }
  }, [data]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const clearCategoryFilter = () => {
    window.location.reload();
  };

  if (isError) {
    return (
      <div className="text-center py-5" style={{ marginTop: "100px" }}>
        <h3 className="fw-bold uppercase">ERROR LOADING PRODUCTS</h3>
      </div>
    );
  }

  if (!data || data.length === 0 || isLoadingImages || !imagesLoaded) {
    return (
      <div className="text-center py-5" style={{ marginTop: "120px" }}>
        <h4 className="fw-bold text-uppercase tracking-wider">LOADING COLLECTION...</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "100px" }}>
      {selectedCategory && (
        <div className="d-flex align-items-center justify-content-between mb-4 p-3 border border-2 border-dark bg-light">
          <div className="d-flex align-items-center gap-2">
            <span className="badge fs-6">{selectedCategory}</span>
            <span className="text-uppercase fw-bold">FILTER APPLIED</span>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={clearCategoryFilter}
          >
            CLEAR FILTER
          </button>
        </div>
      )}
      
      <div className="grid">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5 w-100">
            <h3 className="fw-bold uppercase">NO PRODUCTS AVAILABLE IN THIS CATEGORY</h3>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const { id, brand, name, price, productAvailable, imageUrl } = product;

            return (
              <div className="product-card" key={id}>
                <Link
                  to={`/product/${id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}
                >
                  {/* Strict 1:1 Aspect Ratio Image Container */}
                  <div className="product-img-wrapper">
                    <img
                      src={imageUrl}
                      alt={name || brand}
                      className="product-img"
                    />
                  </div>

                  <div className="card-body-flex">
                    <div>
                      <p className="card-brand">{brand}</p>
                      <h4 className="product-name-text">{name || brand}</h4>
                    </div>

                    <div className="product-price-badge">
                      <span className="price-label">LKR {price}</span>
                      {!productAvailable ? (
                        <span className="out-of-stock-badge">OUT OF STOCK</span>
                      ) : (
                        <span className="badge">AVAILABLE</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;