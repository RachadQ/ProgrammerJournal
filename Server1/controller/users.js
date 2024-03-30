
const UserModel = require( "../models/user");
const express = require('express');
const register = async (
    req,
    res,
    next)=> {
        try{
            const newUser = new UserModel({
                email:req.body.email,
                username: req.body.username,
                password: req.body.password,
            });
            console.log('newUser', newUser)
            const savedUser = await newUser.save();
            console.log('savedUser', savedUser)
        }catch(err)
        {

        }

};

module.exports = {register};