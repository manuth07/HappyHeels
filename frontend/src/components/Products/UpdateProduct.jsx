import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../axios";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState();
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        setProduct(response.data);
      
        const responseImage = await API.get(
          `/product/${id}/image`,
          { responseType: "blob" }
        );
        const imageFile = await converUrlToFile(responseImage.data, response.data.imageName);
        setImage(imageFile);     
        setUpdateProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const converUrlToFile = async(blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  };
 
  const handleSubmit = async(e) => {
    e.preventDefault();
    const updatedProduct = new FormData();
    updatedProduct.append("imageFile", image);
    updatedProduct.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], { type: "application/json" })
    );
    
    const token = localStorage.getItem('token');
    API
      .put(`/product/${id}`, updatedProduct, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      })
      .then((response) => {
        alert("Product updated successfully!");
        navigate(`/product/${id}`);
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        alert("Failed to update product. Please try again.");
      });
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct({
      ...updateProduct,
      [name]: value,
    });
  };
  
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };
  
  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "68px", marginBottom: "50px" }}>
      <div className="border rounded-3 p-4 bg-white">
        <h2 className="section-title mb-4 border-bottom pb-3">Update Product #{id}</h2>
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-control"
              value={updateProduct.name}
              onChange={handleChange}
              name="name"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Brand *</label>
            <input
              type="text"
              name="brand"
              className="form-control"
              value={updateProduct.brand}
              onChange={handleChange}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              rows={3}
              name="description"
              onChange={handleChange}
              value={updateProduct.description}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Price (LKR) *</label>
            <input
              type="number"
              className="form-control"
              onChange={handleChange}
              value={updateProduct.price}
              name="price"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={updateProduct.category}
              onChange={handleChange}
              name="category"
            >
              <option value="">Select Category</option>
              <option value="Gents">Gents</option>
              <option value="Ladies">Ladies</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Stock Quantity *</label>
            <input
              type="number"
              className="form-control"
              onChange={handleChange}
              value={updateProduct.stockQuantity}
              name="stockQuantity"
            />
          </div>
          <div className="col-md-12">
            <label className="form-label">Product Image</label>
            {image && (
              <div className="mb-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Product preview"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid #E5E5E5"
                  }}
                />
              </div>
            )}
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="productAvailable"
                id="gridCheck"
                checked={updateProduct.productAvailable}
                onChange={(e) =>
                  setUpdateProduct({ ...updateProduct, productAvailable: e.target.checked })
                }
              />
              <label className="form-check-label fw-medium" htmlFor="gridCheck">
                Product Available for Purchase
              </label>
            </div>
          </div>

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary">
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
