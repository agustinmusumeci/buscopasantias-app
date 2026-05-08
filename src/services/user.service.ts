import { UserRepository } from "@/repositories/user.repository";
import type { User } from "../../prisma/zod";
import { InternshipService } from "./internship.service";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getSuscriptedUsers(careers: Array<string>, keywords: Array<string>) {
    const usersData = await this.userRepository.getSuscriptedUsers(careers, keywords);

    const users = usersData.map((user: any) => {
      return this.mapUserToJson(user, false);
    });

    return users;
  }

  async getUser(userId: string | undefined): Promise<User> {
    try {
      if (!userId) throw new Error("Empty user id");

      const user: any = await this.userRepository.getUser(userId);

      if (!user) return {} as User;

      return this.mapUserToJson(user, true);
    } catch (e) {
      console.log(e);
      return {} as User;
    }
  }

  async getUserNotifications(userId: string | undefined) {
    try {
      if (!userId) throw new Error("Empty user id");

      const data = await this.userRepository.getUserNotifications(userId);

      if (!data || data.length === 0) return [];

      const internshipService = new InternshipService();

      const internships = data.map((el: any) => {
        const internship = {
          userId: el.user_id,
          seen: el.seen,
          internship: internshipService.mapInternship(el.Internship),
        };
        return internship;
      });

      return internships;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async countUserNotifications(userId: string): Promise<number> {
    try {
      const notificationsCount = await this.userRepository.countUserNotifications(userId);

      return notificationsCount;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }

  async getSavedInternships(userId: string, internshipId?: number) {
    try {
      const data = await this.userRepository.getSavedInternships(userId, internshipId);

      if (!data || data?.length === 0) return [];

      const internshipService = new InternshipService();

      const res = data.map((i) => {
        const internship = internshipService.mapInternship(i?.Internship);

        return internship;
      });

      return res;
    } catch (e) {
      console.log(e);

      return [];
    }
  }

  async createNotification(userId: string, internships: Array<number>) {
    const notifications = internships.map((id) => ({
      user_id: userId,
      internship_id: id,
      seen: false,
    }));

    return await this.userRepository.createNotifications(notifications);
  }

  async saveInternship(internshipId: number, userId: string, saved: boolean = true) {
    try {
      await this.userRepository.saveInternship(internshipId, userId, saved);
      return { message: "Pasantía guardada correctamente", ok: true, error: undefined };
    } catch (e) {
      console.log(e);

      return { message: "Error guardando la pasantía - Intente más tarde", ok: false, error: e instanceof Error ? e?.message : String(e) };
    }
  }

  async markNotificationAsRead(userId: string, internships: Array<number>) {
    try {
      await this.userRepository.markNotificationAsRead(userId, internships);
      return internships;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  async syncUser(userId: string, name?: string, mail?: string, suscripted?: boolean) {
    try {
      return await this.userRepository.syncUser(userId, name, mail, suscripted);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  async suscribeCareers(userId: string, toSuscribeCareers: Array<string>, toDeleteCareers: Array<string>) {
    try {
      return await this.userRepository.suscribeCareers(userId, toSuscribeCareers, toDeleteCareers);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  async suscribeKeywords(userId: string, toSuscribeKeywords: Array<string>, toDeleteKeywords: Array<string>) {
    try {
      return await this.userRepository.suscribeKeywords(userId, toSuscribeKeywords, toDeleteKeywords);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  mapUserToJson(user: User & { userCareers?: Array<any>; userKeywords: Array<any> }, hasUniversities: boolean = true) {
    let careers;

    // Group careers based on its university
    if (hasUniversities) {
      const universitiesMap = new Map<
        string,
        {
          university: { id: string; name: string };
          careers: { id: string; name: string; color: string; bg: string }[];
        }
      >();

      if (user?.userCareers) {
        for (const { Career } of user?.userCareers) {
          for (const { University } of Career?.universityCareers) {
            if (!universitiesMap.has(University?.id)) {
              universitiesMap.set(University?.id, {
                university: University,
                careers: [],
              });
            }
            universitiesMap.get(University.id)!.careers.push({
              id: Career?.id,
              name: Career?.name,
              color: Career?.color,
              bg: Career?.bg,
            });
          }
        }
      }

      careers = Array.from(universitiesMap.values());
    } else {
      careers =
        user?.userCareers?.map((career) => ({
          id: career?.career_id,
          name: career?.Career?.name,
          color: career?.Career?.color,
        })) ?? [];
    }

    const newUser = {
      id: user?.id,
      name: user?.name,
      mail: user?.mail,
      suscripted: user?.suscripted,
      careers: careers,
      keywords:
        user?.userKeywords?.map((keyword) => {
          return keyword?.keyword;
        }) ?? [],
    };

    return newUser;
  }
}
