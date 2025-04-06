"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../config");
class UserService {
    static createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield config_1.prisma.user.create({
                data,
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            });
            return user;
        });
    }
    static getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield config_1.prisma.user.findUnique({
                where: {
                    email,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    password: true,
                    bio: true,
                },
            });
            return user;
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                return;
            const user = yield config_1.prisma.user.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    bio: true,
                    _count: true,
                },
            });
            return user;
        });
    }
    static getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield config_1.prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    bio: true,
                    _count: true,
                },
            });
            return users;
        });
    }
}
exports.default = UserService;
