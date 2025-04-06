import { prisma } from "../../config";
import { UserType } from "../validator/user.validator";

class UserService {
  public static async createUser(data: UserType) {
    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return user;
  }

  public static async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
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
  }

  public static async getUserById(id: number) {
    if (!id) return;
    const user = await prisma.user.findUnique({
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
  }

  public static async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        _count: true,
      },
    });
    return users;
  }
}

export default UserService;
