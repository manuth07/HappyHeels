import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useState } from "react";
import AppContext from "../../Context/Context";
import API from "../../axios"; // use axios instance
import unplugged from "../../assets/unplugged.png";
import UpdateProduct from "./UpdateProduct";
import Reviews from "./Reviews";
import "./Product.css";
const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, cart, refreshData, user } =
    useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  
  // Check if user is admin
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
    try {
      await API.delete(`/product/${id}`);
      removeFromCart(id);
      console.log("Product deleted successfully");
      alert("Product deleted successfully");
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
    const isLoggedIn = !!localStorage.getItem('token');
    if (isLoggedIn) {
      alert("Product added to cart");
    } else {
      alert("Added to cart. Create an account or login to checkout.");
    }
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
      <h2 className="text-center" style={{ padding: "10rem" }}>
        Loading...
      </h2>
    );
  }
  return (
    <>
      <div className="containers" style={{ display: "flex" }}>
        <img
          className="left-column-img"
          src={imageUrl || unplugged}
          alt={product.imageName || product.name}
        />

        <div className="right-column" style={{ width: "50%" }}>
          <div className="product-description">
            <div className="product-meta-row">
            <span>
              {product.category}
            </span>
            <p className="release-date">
              <h6>Listed : <span> <i> {product.date ? new Date(product.date).toLocaleDateString() : '-'}</i></span></h6>
            </p>
            </div>
            
           
            <h1 className="product-title-lg">
              {product.name}
            </h1>
            <i style={{ marginBottom: "3rem" }}>{product.brand}</i>
            <p className="desc-label">PRODUCT DESCRIPTION :</p>
            <p style={{ marginBottom: "1rem" }}>{product.description}</p>
          </div>

          <div className="product-price">
            <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {"Rs " + product.price}
            </span>
            
            {/* Main Action Buttons */}
            <div className="main-action-buttons">
              <button
                className={`add-to-cart-btn ${
                  !product.productAvailable ? "disabled-btn" : ""
                }`}
                onClick={handlAddToCart}
                disabled={!product.productAvailable}
              >
                <i className="bi bi-cart-plus"></i>
                {product.productAvailable ? "Add to Cart" : "Out of Stock"}
              </button>
              
              <button
                className="view-reviews-btn"
                onClick={scrollToReviews}
              >
                <i className="bi bi-star-fill"></i>
                View Reviews
              </button>
            </div>
            {!localStorage.getItem('token') && (
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                You can add items as a visitor. Please login or register to checkout.
              </p>
            )}
            
            <h6 style={{ marginBottom: "1rem" }}>
              Stock Available :{" "}
              <i style={{ color: "green", fontWeight: "bold" }}>
                {product.stockQuantity}
              </i>
            </h6>
          </div>
          
          {/* Admin Only Buttons */}
          {isAdmin && (
            <div className="admin-action-buttons">
              <button
                className="update-btn"
                type="button"
                onClick={handleEditClick}
              >
                <i className="bi bi-pencil-square"></i>
                Update Product
              </button>
              <button
                className="delete-btn"
                type="button"
                onClick={deleteProduct}
              >
                <i className="bi bi-trash"></i>
                Delete Product
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <Reviews productId={product.id} />
    </>
  );
};

export default Product;
