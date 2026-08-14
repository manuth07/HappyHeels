import { useNavigate, useParams } from "react-router-dom";
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
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS PRODUCT?")) return;
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
        <h4 className="fw-bold text-uppercase">LOADING PRODUCT DETAILS...</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "100px" }}>
      <div className="containers mb-5">
        <img
          className="left-column-img"
          src={imageUrl || unplugged}
          alt={product.imageName || product.name}
        />

        <div className="right-column">
          <div className="product-description">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge fs-6">{product.category}</span>
              <span className="text-uppercase fw-bold small">
                LISTED: {product.date ? new Date(product.date).toLocaleDateString() : '-'}
              </span>
            </div>
            
            <h1 className="product-title-lg">
              {product.name}
            </h1>
            <p className="fw-bold text-uppercase tracking-wider text-muted mb-4">{product.brand}</p>
            
            <p className="desc-label">DESCRIPTION:</p>
            <p className="mb-4 lead fs-6">{product.description}</p>
          </div>

          <div className="product-price">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="fs-1 fw-bold tracking-wider">
                LKR {product.price}
              </span>
              <span className="badge bg-light text-dark border border-dark">
                STOCK: {product.stockQuantity} UNITS
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
                {product.productAvailable ? "ADD TO BAG" : "OUT OF STOCK"}
              </button>
              
              <button
                className="view-reviews-btn"
                onClick={scrollToReviews}
              >
                CUSTOMER REVIEWS
              </button>
            </div>

            {!localStorage.getItem('token') && (
              <p className="small text-uppercase fw-bold text-muted mt-2">
                VISITOR MODE: ADD ITEMS TO BAG AND LOGIN AT CHECKOUT.
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
                EDIT PRODUCT
              </button>
              <button
                className="delete-btn"
                type="button"
                onClick={deleteProduct}
              >
                DELETE PRODUCT
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
