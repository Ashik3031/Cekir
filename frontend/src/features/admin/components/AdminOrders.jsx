import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersAsync,
  resetOrderUpdateStatus,
  selectOrderUpdateStatus,
  selectOrders,
  updateOrderByIdAsync,
} from "../../order/OrderSlice";
import {
  Avatar, Button, Chip, FormControl, IconButton, InputLabel, MenuItem,
  Select, Stack, Typography, useMediaQuery, useTheme
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { noOrdersAnimation } from "../../../assets/index";
import Lottie from "lottie-react";

export const AdminOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders) ?? [];
  const [editIndex, setEditIndex] = useState(-1);
  const orderUpdateStatus = useSelector(selectOrderUpdateStatus);
  const theme = useTheme();
  const is1620 = useMediaQuery(theme.breakpoints.down(1620));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const { register, handleSubmit, reset } = useForm();

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(getAllOrdersAsync());
  }, [dispatch]);

  useEffect(() => {
    if (orderUpdateStatus === "fulfilled") toast.success("Status updated");
    else if (orderUpdateStatus === "rejected") toast.error("Error updating order status");
  }, [orderUpdateStatus]);

  useEffect(() => {
    return () => { dispatch(resetOrderUpdateStatus()); };
  }, [dispatch]);

  // ============== Helpers ==============

  const getUserName = (o) =>
    o?.user?.name ||
    [o?.user?.firstName, o?.user?.lastName].filter(Boolean).join(" ") ||
    "—";

  const getEmail = (o) =>
    o?.email || o?.user?.email || "—";

  // Pull phone from user; fallback to order.address.phoneNumber
  const getPhone = (o) => {
    const u = o?.user || {};
    return (
      u.phoneNumber ||
      u.phone ||
      u.mobileNumber ||
      u.mobile ||
      u.contactNumber ||
      u.contact ||
      u.whatsapp ||
      o?.address?.phoneNumber ||
      "—"
    );
  };

  // item image
  const itemImage = (item) =>
    item?.variant?.images?.[0] ||
    item?.product?.defaultImages?.[0] ||
    item?.product?.thumbnail ||
    "";

  // item title
  const itemTitle = (item) =>
    item?.product?.name ||
    item?.product?.title ||
    item?.variant?.title ||
    "—";

  // attributes shown under item name
  const itemAttrs = (item) => {
    const attrs =
      item?.optionValues ||
      item?.variant?.attributes ||
      item?.variant?.optionValues ||
      {};

    const parts = [];
    if (attrs.Color) parts.push(`Color: ${attrs.Color}`);
    if (attrs.Size) parts.push(`Size: ${attrs.Size}`);

    if (!parts.length && attrs && typeof attrs === "object") {
      Object.entries(attrs).forEach(([k, v]) => parts.push(`${k}: ${String(v)}`));
    }

    if (item?.size && !parts.some((p) => p.startsWith("Size:"))) {
      parts.push(`Size: ${item.size}`);
    }

    return parts.join(" · ");
  };

  const handleUpdateOrder = (data) => {
    const current = paginatedOrders?.[editIndex];
    if (!current?._id) return;
    const update = { ...data, _id: current._id };
    setEditIndex(-1);
    reset();
    dispatch(updateOrderByIdAsync(update));
  };

  const editOptions = ["Pending", "Dispatched", "Out for delivery", "Delivered", "Cancelled"];

  const getStatusColor = (status) => {
    if (status === "Pending") return { bgcolor: "#dfc9f7", color: "#7c59a4" };
    if (status === "Dispatched") return { bgcolor: "#feed80", color: "#927b1e" };
    if (status === "Out for delivery") return { bgcolor: "#AACCFF", color: "#4793AA" };
    if (status === "Delivered") return { bgcolor: "#b3f5ca", color: "#548c6a" };
    if (status === "Cancelled") return { bgcolor: "#fac0c0", color: "#cc6d72" };
    return {};
  };

  // current page slice
  const paginatedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return orders.slice(start, end);
  }, [orders, page, rowsPerPage]);

  // clamp page & reset edit when data changes
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(orders.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
    setEditIndex(-1);
    reset();
  }, [orders.length, page, rowsPerPage, reset]);

  const handleChangePage = (_e, newPage) => {
    setPage(newPage);
    setEditIndex(-1);
    reset();
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
    setEditIndex(-1);
    reset();
  };

  return (
    <Stack justifyContent="center" alignItems="center">
      <Stack mt={5} mb={3} component="form" noValidate onSubmit={handleSubmit(handleUpdateOrder)}>
        {orders.length ? (
          <Paper elevation={2} sx={{ width: is1620 ? "95vw" : "auto" }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table aria-label="orders">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell align="left">Id</TableCell>
                    <TableCell align="left">Customer</TableCell>
                    <TableCell align="left">Email</TableCell>
                    <TableCell align="left">Items</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell align="right">Shipping Address</TableCell>
                    <TableCell align="right">Payment Method</TableCell>
                    <TableCell align="right">Order Date</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedOrders.map((order, idxOnPage) => {
                    const absoluteIndex = page * rowsPerPage + idxOnPage;
                    const addr = order?.address ?? {};
                    return (
                      <TableRow
                        key={order?._id ?? `${order?.orderNo ?? "row"}-${absoluteIndex}`}
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">{absoluteIndex + 1}</TableCell>
                        <TableCell align="left">{order?.orderNo ?? order?._id ?? "—"}</TableCell>

                        {/* Customer + Phone */}
                        <TableCell align="left">
                          <Stack>
                            <Typography>{getUserName(order)}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              📞 {getPhone(order)}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Email */}
                        <TableCell align="left">
                          <Typography>{getEmail(order)}</Typography>
                        </TableCell>

                        {/* Items (name + attrs + qty) */}
                        <TableCell align="left">
                          {(order?.items ?? []).map((it) => (
                            <Stack
                              key={it?._id ?? it?.variant?._id ?? `${order?._id}-${Math.random()}`}
                              mt={2}
                              direction="row"
                              alignItems="center"
                              columnGap={2}
                              flexWrap="wrap"
                            >
                              <Avatar src={itemImage(it)} />
                              <Stack>
                                <Typography>{itemTitle(it)}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {itemAttrs(it)}
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                Qty: {it?.quantity ?? 1}
                              </Typography>
                            </Stack>
                          ))}
                        </TableCell>

                        {/* Total */}
                        <TableCell align="right">
                          {typeof order?.total === "number" ? order.total.toFixed(2) : (order?.total ?? "—")}
                        </TableCell>

                        {/* Full Address (multi-line) */}
                        <TableCell align="right">
                          <Stack spacing={0.25} alignItems="flex-end">
                            {addr?.type && (
                              <Chip size="small" label={addr.type} sx={{ alignSelf: "flex-end", mb: 0.25 }} />
                            )}
                            <Typography>{addr?.street || "—"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {[addr?.city, addr?.state].filter(Boolean).join(", ") || "—"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {[addr?.postalCode, addr?.country].filter(Boolean).join(", ") || "—"}
                            </Typography>
                            {addr?.phoneNumber && (
                              <Typography variant="body2" color="text.secondary">
                                📞 {addr.phoneNumber}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        {/* Payment */}
                        <TableCell align="right">{order?.paymentMode ?? "—"}</TableCell>

                        {/* Date */}
                        <TableCell align="right">
                          {order?.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                        </TableCell>

                        {/* Status */}
                        <TableCell align="right">
                          {editIndex === idxOnPage ? (
                            <FormControl fullWidth>
                              <InputLabel id={`status-label-${absoluteIndex}`}>Update status</InputLabel>
                              <Select
                                defaultValue={order?.status ?? "Pending"}
                                labelId={`status-label-${absoluteIndex}`}
                                id={`status-select-${absoluteIndex}`}
                                label="Update status"
                                {...register("status", { required: "Status is required" })}
                              >
                                {["Pending", "Dispatched", "Out for delivery", "Delivered", "Cancelled"].map((option) => (
                                  <MenuItem value={option} key={option}>{option}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip label={order?.status ?? "Pending"} sx={getStatusColor(order?.status)} />
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          {editIndex === idxOnPage ? (
                            <Button type="submit">
                              <IconButton><CheckCircleOutlinedIcon /></IconButton>
                            </Button>
                          ) : (
                            <IconButton onClick={() => {
                              setEditIndex(idxOnPage);
                              reset();
                            }}>
                              <EditOutlinedIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={orders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Paper>
        ) : (
          <Stack width={is480 ? "auto" : "30rem"} justifyContent="center">
            <Stack rowGap="1rem">
              <Lottie animationData={noOrdersAnimation} />
              <Typography textAlign="center" alignSelf="center" variant="h6" fontWeight={400}>
                There are no orders currently
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
