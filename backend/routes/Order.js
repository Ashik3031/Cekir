const express=require('express')
const orderController=require("../controllers/Order")
const router=express.Router()


router
    .post("/",orderController.create)
    .get("/",orderController.getAll)
    .get("/:id",orderController.getByOrderId)
    .get("/user/:id",orderController.getByUserId)
    .patch("/:id",orderController.updateById)


module.exports=router