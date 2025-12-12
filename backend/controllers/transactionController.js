// backend/controllers/transactionController.js
import Transaction from "../models/TransactionModel.js";
import User from "../models/UserSchema.js";
import moment from "moment";
import {
  sendLimitEmailToUser,
  sendWarningEmailToUser,
} from "../utils/email.js";

// MONTHLY warning limits per category (you can change values)
const CATEGORY_LIMITS = {
  "Groceries & Vegetables": 8000,
  "Milk & Dairy": 2000,
  "House Rent / Home EMI": 10000,
  "Maintenance & Society Charges": 1000,
  "Electricity & Water": 1500,
  "LPG / Cooking Gas": 1000,
  "Mobile & Internet": 1000,
  "Education & Fees": 50000,
  "Medical & Pharmacy": 5000,
  "Insurance (Life/Health)": 2500,
  "Local Transport": 1500,
  "Fuel & Vehicle Running": 3000,
  "Eating Out & Restaurants": 2000,
  "Entertainment & Subscriptions": 1000,
  "Clothing & Footwear": 1500,
  "Household Items & Appliances": 1500,
  "EMIs & Other Loans": 3000,
  "Savings & Investments": 0, // no limit
  "Miscellaneous / Others": 1500,
};

export const addTransactionController = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      date,
      category,
      userId,
      transactionType,
    } = req.body;

    if (
      !title ||
      !amount ||
      !description ||
      !date ||
      !category ||
      !transactionType
    ) {
      return res.status(408).json({
        success: false,
        messages: "Please Fill all fields",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // create transaction
    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType,
    });

    user.transactions.push(newTransaction);
    await user.save();

    // ---- MONTHLY LIMIT CHECK ----
    let budgetAlert = false;
    let budgetAlertMessage = "";
    let warningAlert = false;
    let warningAlertMessage = "";

    const hasLimit =
      typeof CATEGORY_LIMITS[category] === "number" &&
      CATEGORY_LIMITS[category] > 0;

    if (transactionType === "expense" && hasLimit) {
      const txDate = new Date(date || new Date());
      const startOfMonth = new Date(
        txDate.getFullYear(),
        txDate.getMonth(),
        1
      );

      const monthlyExpenses = await Transaction.aggregate([
        {
          $match: {
            user: newTransaction.user,
            transactionType: "expense",
            category,
            date: { $gte: startOfMonth, $lte: txDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const spent = monthlyExpenses[0]?.total || 0;
      const limit = CATEGORY_LIMITS[category];
      const warnThreshold = Math.round(limit * 0.8); // 80% warning point

      console.log("LIMIT DEBUG =>", {
        category,
        spent,
        limit,
        warnThreshold,
        userId: user._id,
        userEmail: user.email,
      });

      try {
        if (spent >= limit) {
          // HARD LIMIT ALERT
          budgetAlert = true;
          budgetAlertMessage = `You have crossed the monthly limit for ${category}. Limit: ₹${limit}, this month spent: ₹${spent}.`;
          await sendLimitEmailToUser(user._id, category, spent, limit);
        } else if (spent >= warnThreshold) {
          // EARLY WARNING ALERT
          warningAlert = true;
          warningAlertMessage = `You are close to your monthly limit for ${category}. Limit: ₹${limit}, this month spent: ₹${spent}.`;
          await sendWarningEmailToUser(user._id, category, spent, limit);
        }
      } catch (e) {
        console.error("Failed to send limit/warning email", e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Transaction Added Successfully",
      budgetAlert,
      budgetAlertMessage,
      warningAlert,
      warningAlertMessage,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const getAllTransactionController = async (req, res) => {
  try {
    const { userId, type, frequency, startDate, endDate } = req.body;

    console.log(userId, type, frequency, startDate, endDate);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const query = {
      user: userId,
    };

    if (type !== "all") {
      query.transactionType = type;
    }

    if (frequency !== "custom") {
      query.date = {
        $gt: moment().subtract(Number(frequency), "days").toDate(),
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate(),
      };
    }

    const transactions = await Transaction.find(query);

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const deleteTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.body.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const transactionElement = await Transaction.findByIdAndDelete(
      transactionId
    );

    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "transaction not found",
      });
    }

    const transactionArr = user.transactions.filter(
      (transaction) => transaction._id === transactionId
    );

    user.transactions = transactionArr;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Transaction successfully deleted`,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const updateTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;

    const { title, amount, description, date, category, transactionType } =
      req.body;

    console.log(title, amount, description, date, category, transactionType);

    const transactionElement = await Transaction.findById(transactionId);

    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "transaction not found",
      });
    }

    if (title) {
      transactionElement.title = title;
    }

    if (description) {
      transactionElement.description = description;
    }

    if (amount) {
      transactionElement.amount = amount;
    }

    if (category) {
      transactionElement.category = category;
    }

    if (transactionType) {
      transactionElement.transactionType = transactionType;
    }

    if (date) {
      transactionElement.date = date;
    }

    await transactionElement.save();

    return res.status(200).json({
      success: true,
      message: `Transaction Updated Successfully`,
      transaction: transactionElement,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};
