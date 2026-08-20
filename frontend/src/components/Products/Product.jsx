import { useNavigate, useParams } from "react";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../Context/Context";
import API from "../../axios";
import unplugged from "../../assets/unplugged.png";
import Reviews from "./Reviews";
import "./Product.css";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData, user } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  
  const isAdmin = user && user.role === 'ROLE_ADMIN';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        const fetched = response.data;
        setProduct(fetched);

        if (fetched.imageUrl) {
          const serverBase = (API.defaults.baseURL || "http://localhost:8080/api").replace(/\/api\/?$/, "");
          const fullUrl = fetched.imageUrl.startsWith("http")
            ? fetched.imageUrl
            : `${serverBase}${fetched.imageUrl}`;
          setImageUrl(fullUrl);
        } else {
          try {
            const imgRes = await API.get(`/product/${id}/image`, { responseType: "blob" });
            if (imgRes?.data) {
              setImageUrl(URL.createObjectURL(imgRes.data));
            } else {
              setImageUrl(unplugged);
            }
          } catch (imgErr) {
            setImageUrl(unplugged);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/product/${id}`);
      removeFromCart(id);
      refreshData();
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handlAddToCart = () => {
    addToCart(product);
  };

  const scrollToReviews = () => {
    const reviewsElement = document.getElementById('reviews');
    if (reviewsElement) {
      reviewsElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (!product) {
    return (
      <div className="text-center py-5" style={{ marginTop: "120px" }}>
        <div className="spinner-border text-dark mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="subtitle">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "68px" }}>
      <div className="containers mb-5">
        <img
          className="left-column-img"
          src={imageUrl || unplugged}
          alt={product.imageName || product.name}
        />

        <div className="right-column">
          <div className="product-description">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="badge badge-purple">{product.category}</span>
              <span className="subtitle">
                Listed: {product.date ? new Date(product.date).toLocaleDateString() : '-'}
              </span>
            </div>
            
            <h1 className="product-title-lg">
              {product.name}
            </h1>
            <p className="subtitle mb-3" style={{ fontSize: "15px" }}>{product.brand}</p>
            
            <p className="desc-label">Description</p>
            <p className="body-text text-secondary mb-4">{product.description}</p>
          </div>

          <div className="product-price">
            <div className="d-flex align-items-center gap-3 mb-4">
              <span style={{ fontSize: "28px", fontWeight: "700", color: "#111111" }}>
                LKR {product.price}
              </span>
              <span className="badge badge-neutral">
                Stock: {product.stockQuantity} units
              </span>
            </div>
            
            {/* Main Action Buttons */}
            <div className="main-action-buttons">
              <button
                className={`add-to-cart-btn ${
                  !product.productAvailable ? "disabled-btn" : ""
                }`}
                onClick={handlAddToCart}
                disabled={!product.productAvailable}
              >
                <i className="bi bi-bag me-1"></i>
                {product.productAvailable ? "Add to Bag" : "Out of Stock"}
              </button>
              
              <button
                className="view-reviews-btn"
                onClick={scrollToReviews}
              >
                <i className="bi bi-chat-left-text me-1"></i>
                Customer Reviews
              </button>
            </div>

            {!localStorage.getItem('token') && (
              <p className="subtitle mt-2">
                Visitor mode: Add items to bag and login at checkout.
              </p>
            )}
          </div>
          
          {/* Admin Only Buttons */}
          {isAdmin && (
            <div className="admin-action-buttons">
              <button
                className="update-btn"
                type="button"
                onClick={handleEditClick}
              >
                <i className="bi bi-pencil me-1"></i> Edit Product
              </button>
              <button
                className="delete-btn"
                type="button"
                onClick={deleteProduct}
              >
                <i className="bi bi-trash me-1"></i> Delete Product
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <Reviews productId={product.id} />
    </div>
  );
};

export default Product;
