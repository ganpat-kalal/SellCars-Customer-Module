const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomerByIntnr,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  uploadCustomers,
  uploadContactPersons,
  uploadAddresses,
} = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/", limits: { fileSize: 500 * 1024 } });

router.use(authMiddleware);

router.route("/").get(getCustomers).post(createCustomer);
router.route("/:intnr").get(getCustomerByIntnr).put(updateCustomer).delete(deleteCustomer);

router.route("/upload/customers").post(upload.single("file"), uploadCustomers);
router.route("/upload/contact-persons").post(upload.single("file"), uploadContactPersons);
router.route("/upload/addresses").post(upload.single("file"), uploadAddresses);

module.exports = router;
