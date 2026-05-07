import prisma from "../lib/prisma";

export class UserRepository {
  async getSuscriptedUsers(careers: Array<string>, keywords: Array<string>) {
    return await prisma.user.findMany({
      where: { suscripted: true, OR: [{ userCareers: { some: { career_id: { in: careers } } } }, { userKeywords: { some: { keyword: { in: keywords } } } }] },
      include: { userCareers: { include: { Career: true }, where: { career_id: { in: careers } } }, userKeywords: { where: { keyword: { in: keywords } } } },
    });
  }

  async getUser(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        userCareers: {
          include: {
            Career: {
              include: {
                universityCareers: {
                  include: {
                    University: true,
                  },
                },
              },
            },
          },
        },
        userKeywords: true,
      },
    });

    if (!user) return null;

    return user;
  }

  async getUserNotifications(userId: string) {
    return await prisma.userNotification.findMany({
      where: { user_id: userId, seen: false },
      include: { Internship: { include: { internshipCareers: { include: { Career: true } }, Company: true } } },
      orderBy: { Internship: { created_at: "desc" } },
    });
  }

  async countUserNotifications(userId: string): Promise<number> {
    return await prisma.userNotification.count({ where: { user_id: userId, seen: false } });
  }

  async getSavedInternships(userId: string, internshipId?: number) {
    const where = { user_id: userId } as { user_id: string; internship_id?: number };

    if (internshipId) {
      where["internship_id"] = internshipId;
    }

    return await prisma.userSaveInternship.findMany({ where: where, include: { Internship: { include: { Company: true, University: true, internshipCareers: { include: { Career: true } } } } } });
  }

  async createNotifications(notifications: Array<{ user_id: string; internship_id: number; seen: boolean }>) {
    return await prisma.userNotification.createMany({ data: notifications, skipDuplicates: true });
  }

  async markNotificationAsRead(userId: string, internships: Array<number>) {
    return await prisma.userNotification.updateMany({ data: { seen: true }, where: { user_id: userId, internship_id: { in: internships } } });
  }

  async saveInternship(internshipId: number, userId: string, saved: boolean) {
    if (saved) {
      return await prisma.userSaveInternship.create({ data: { internship_id: internshipId, user_id: userId } });
    } else {
      return await prisma.userSaveInternship.delete({
        where: {
          user_id_internship_id: {
            internship_id: internshipId,
            user_id: userId,
          },
        },
      });
    }
  }

  async syncUser(userId: string, name?: string, mail?: string, suscripted?: boolean) {
    const update = {} as { name: string; mail: string; suscripted: boolean };

    if (name) {
      update["name"] = name;
    }

    if (mail) {
      update["mail"] = mail;
    }

    if (typeof suscripted === "boolean") {
      update["suscripted"] = suscripted;
    }

    return await prisma.user.upsert({
      where: {
        id: userId,
      },
      update: update,
      create: {
        id: userId,
        name: name ?? "",
        mail: mail ?? "",
      },
    });
  }

  async suscribeCareers(userId: string, toSuscribeCareers: Array<string>, toDeleteCareers: Array<string>) {
    const toSuscribe = toSuscribeCareers.map((c) => ({ user_id: userId, career_id: c }));
    await prisma.userCareer.createMany({ data: toSuscribe, skipDuplicates: true });

    // Delete career if needed
    if (toDeleteCareers && toDeleteCareers?.length > 0) {
      const where = { AND: [{ user_id: userId, OR: toDeleteCareers.map((c) => ({ career_id: c })) }] };

      await prisma.userCareer.deleteMany({ where: where });
    }

    return;
  }

  async suscribeKeywords(userId: string, toSuscribeKeywords: Array<string>, toDeleteKeywords: Array<string>) {
    const toSuscribe = toSuscribeKeywords.map((k) => ({ user_id: userId, keyword: k.toLowerCase() }));
    await prisma.userKeyword.createMany({ data: toSuscribe, skipDuplicates: true });

    // Delete keyword if needed
    if (toDeleteKeywords && toDeleteKeywords?.length > 0) {
      const where = { AND: [{ user_id: userId, OR: toDeleteKeywords.map((k) => ({ keyword: k })) }] };

      await prisma.userKeyword.deleteMany({ where: where });
    }

    return;
  }
}
