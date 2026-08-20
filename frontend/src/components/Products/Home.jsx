import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../axios";
import AppContext from "../../Context/Context";
import unplugged from "../../assets/unplugged.png";

const Home = ({ selectedCategory }) => {
  const { data, isError, refreshData, user, addToCart } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "All");
  const navigate = useNavigate();

  const isAdmin = user && user.role === 'ROLE_ADMIN';
  const categories = ["All", "Gents", "Ladies", "Kids", "Accessories"];

  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    setActiveCategory(selectedCategory || "All");
  }, [selectedCategory]);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsLoadingImages(true);
      setImagesLoaded(false);

      const serverBase = (API.defaults.baseURL || "http://localhost:8080/api").replace(/\/api\/?$/, "");

      const fetchImagesAndSetProducts = async () => {
        const imageMap = new Map();

        const imagePromises = data.map(async (product) => {
          if (product.imageUrl) {
            const fullUrl = product.imageUrl.startsWith("http")
              ? product.imageUrl
              : `${serverBase}${product.imageUrl}`;
            imageMap.set(product.id, fullUrl);
            return;
          }

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
          imageUrl: imageMap.get(product.id) || unplugged
        }));

        setProducts(updatedProducts);
        setIsLoadingImages(false);
        setImagesLoaded(true);
      };

      fetchImagesAndSetProducts();
    } else if (data && data.length === 0) {
      setProducts([]);
      setIsLoadingImages(false);
      setImagesLoaded(true);
    }
  }, [data]);

  const filteredProducts = activeCategory && activeCategory !== "All"
    ? products.filter((product) => product.category === activeCategory)
    : products;

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.productAvailable) {
      addToCart(product);
    }
  };

  if (isError) {
    return (
      <div className="text-center py-5" style={{ marginTop: "100px" }}>
        <h3 className="h2 text-danger">Unable to load footwear catalog</h3>
        <p className="text-muted">Please refresh or try again later.</p>
      </div>
    );
  }

  if (!data || isLoadingImages || !imagesLoaded) {
    return (
      <div className="text-center py-5" style={{ marginTop: "120px" }}>
        <div className="spinner-border text-dark mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="subtitle">Loading collection...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "68px" }}>
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom border-light">
        <div>
          <h1 className="page-title mb-1">Footwear Collection</h1>
          <p className="subtitle mb-0">Crafted for everyday comfort and modern style</p>
        </div>

        {/* Horizontal Filter Pills (Styleguide Pattern) */}
        <div className="d-flex align-items-center gap-2 flex-wrap mt-3 mt-md-0">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "All" ? "All Products" : cat}
              {cat === "All"
                ? ` (${products.length})`
                : ` (${products.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-5 my-4 border rounded-3 bg-light p-5">
          <h3 className="h2 mb-2">No products available</h3>
          <p className="subtitle mb-4">
            {activeCategory !== "All"
              ? `There are currently no products under the "${activeCategory}" category.`
              : "Our product inventory is currently empty."}
          </p>
          {isAdmin && (
            <Link to="/add_product" className="btn btn-primary">
              + Add New Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid">
          {filteredProducts.map((product) => {
            const { id, brand, name, price, productAvailable, imageUrl } = product;

            return (
              <div className="product-card" key={id}>
                <Link
                  to={`/product/${id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}
                >
                  <div className="product-img-wrapper">
                    <img
                      src={imageUrl}
                      alt={name || brand}
                      className="product-img"
                    />

                    {/* Floating Quick-Add Button (Styleguide Pattern: 32px circular #111111 button with + icon) */}
                    {productAvailable && (
                      <button
                        className="quick-add-btn"
                        title="Quick Add to Bag"
                        onClick={(e) => handleQuickAdd(e, product)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    )}
                  </div>

                  <div className="card-body-flex">
                    <div>
                      <p className="card-brand">{brand || "Happy Heels"}</p>
                      <h3 className="product-name-text">{name || brand}</h3>
                    </div>

                    <div className="product-price-badge">
                      <span className="price-label">LKR {price}</span>
                      {!productAvailable ? (
                        <span className="out-of-stock-badge">Out of Stock</span>
                      ) : (
                        <span className="badge badge-neutral">In Stock</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;