import Order, { IOrder } from "../models/order.model";

export const createOrder = async (
  data: Partial<IOrder>
): Promise<IOrder> => {
  return await Order.create(data);
};

export const getOrders = async (): Promise<IOrder[]> => {
  return await Order.find().sort({ createdAt: -1 });
};

export const updateOrderStatus = async (
  id: string,
  status: string
): Promise<IOrder | null> => {
  return await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};
