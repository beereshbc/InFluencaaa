import jwt from "jsonwebtoken";

const clientAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: false,
        message: "Not authorized. Login again",
      });
    }

    const clientToken = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(clientToken, process.env.JWT_SECRET);

    req.clientId = decodedToken.id;

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default clientAuth;
