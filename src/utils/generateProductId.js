import { AppError } from "./appError.js";

export const generateProductId = async (category, brand, next) => {
  try {
    // Validation Logic නිවැරදි කරන ලදී (! ලකුණ යෙදීම)
    if (!category) {
      return next(
        new AppError(
          "Please fill out the category before generating product ID",
          STATUS_CODES.BAD_REQUEST,
        ),
      );
    }
    if (!brand) {
      return next(
        new AppError(
          "Please fill out the brand before generating product ID",
          STATUS_CODES.BAD_REQUEST,
        ),
      );
    }

    // Aggregation Count එක සෙවීම
    // 💡 සටහන: DB එකේ fields 'category' ද 'productCategory' ද කියා Schema එක මතක ඇතුව බලන්න
    let result = await Product.aggregate([
      { $match: { category, brand } },
      { $count: "totalProducts" },
    ]);

    result = result.length > 0 ? result[0].totalProducts : 0;

    let categoryName = category.slice(0, 3).toUpperCase();
    const brandName = brand.slice(0, 3).toUpperCase();

    // 🟢 Custom parsing (this.category වෙනුවට category ලෙස නිවැරදි කරන ලදී)
    if (category.includes("&")) {
      const parts = category.split("&");
      const firstWord = parts[0].trim().slice(0, 3).toUpperCase();
      const secondWord = parts[1].trim().slice(0, 3).toUpperCase();
      categoryName = `${firstWord}${secondWord}`; // උදා: LAPDES
    }

    const productId = `${categoryName}-${brandName}-${String(result + 1).padStart(8, "0")}`;
    return productId;
  } catch (err) {
    return next(new AppError(err.message, STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};
