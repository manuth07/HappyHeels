import React, { useState } from "react";
import API from "../../axios";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      alert("PLEASE LOGIN FIRST");
      window.location.href = '/login';
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'ROLE_ADMIN') {
        alert("ONLY ADMINS CAN ADD PRODUCTS");
        return;
      }
    } catch (e) {
      alert("INVALID USER DATA. PLEASE LOGIN AGAIN.");
      window.location.href = '/login';
      return;
    }
    
    API
      .post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      })
      .then((response) => {
        alert("PRODUCT ADDED SUCCESSFULLY");
        setProduct({
          name: "",
          brand: "",
          description: "",
          price: "",
          category: "",
          stockQuantity: "",
          releaseDate: "",
          productAvailable: false,
        });
        setImage(null);
      })
      .catch((error) => {
        console.error("Full error:", error);
        alert("ERROR ADDING PRODUCT: " + (error.response?.data?.message || error.message));
      });
  };

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "100px", marginBottom: "50px" }}>
      <div className="border border-2 border-dark p-4 bg-white" style={{ boxShadow: '4px 4px 0px #000000' }}>
        <h2 className="fw-bold text-uppercase mb-4 border-bottom border-dark pb-3">ADD NEW PRODUCT</h2>
        <form className="row g-3" onSubmit={submitHandler}>
          <div className="col-md-6">
            <label className="form-label">PRODUCT NAME</label>
            <input
              type="text"
              className="form-control"
              placeholder="ENTER PRODUCT NAME"
              onChange={handleInputChange}
              value={product.name}
              name="name"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">BRAND</label>
            <input
              type="text"
              name="brand"
              className="form-control"
              placeholder="ENTER BRAND"
              value={product.brand}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">DESCRIPTION</label>
            <input
              type="text"
              className="form-control"
              placeholder="ENTER DESCRIPTION"
              value={product.description}
              name="description"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">PRICE (LKR)</label>
            <input
              type="number"
              className="form-control"
              placeholder="ENTER PRICE"
              onChange={handleInputChange}
              value={product.price}
              name="price"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">CATEGORY</label>
            <select
              className="form-select"
              value={product.category}
              onChange={handleInputChange}
              name="category"
              required
            >
              <option value="">SELECT CATEGORY</option>
              <option value="Gents">Gents</option>
              <option value="Ladies">Ladies</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">STOCK QUANTITY</label>
            <input
              type="number"
              className="form-control"
              placeholder="STOCK REMAINING"
              onChange={handleInputChange}
              value={product.stockQuantity}
              name="stockQuantity"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">RELEASE DATE</label>
            <input
              type="date"
              className="form-control"
              value={product.releaseDate}
              name="releaseDate"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">PRODUCT IMAGE</label>
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
              required
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="productAvailable"
                id="gridCheck"
                checked={product.productAvailable}
                onChange={(e) =>
                  setProduct({ ...product, productAvailable: e.target.checked })
                }
              />
              <label className="form-check-label text-uppercase fw-bold" htmlFor="gridCheck">
                PRODUCT AVAILABLE
              </label>
            </div>
          </div>
          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
            >
              SUBMIT PRODUCT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
