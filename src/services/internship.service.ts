import { PLACEHOLDER } from "@/constants/placeholders";
import type { Internship } from "../../prisma/zod";
import { INTERNSHIPS_PER_PAGE } from "../constants/paginations";
import { TIME_SINCE_CREATED_COLORS } from "@/constants/time";
import { InternshipRepository } from "@/repositories/internship.repository";

export class InternshipService {
  private internshipRepository: InternshipRepository;

  constructor() {
    this.internshipRepository = new InternshipRepository();
  }

  async scrapeInternships(): Promise<Array<Internship & { careers: Array<string> }>> {
    return await this.internshipRepository.scrapeInternships();
  }

  async getInternships(filter: { careers: Array<string> | undefined; text?: string; time?: string; date?: string; page: number }) {
    try {
      const { data, count } = await this.internshipRepository.getInternships(filter);

      const internships = data.map((internship) => {
        return this.mapInternship(internship);
      });

      const response = {
        data: internships,
        pages: Math.ceil(count / INTERNSHIPS_PER_PAGE),
        ok: true,
        error: undefined,
      };

      return response;
    } catch (e) {
      console.log(e);

      return {
        message: "Ocurrio un error al obtener las pasantías - Intente más tarde",
        data: [],
        pages: 0,
        ok: true,
        error: e,
      };
    }
  }

  async getInternship(id: number | undefined = undefined, arm: string = "") {
    try {
      if (!id && !arm) return {} as Internship;

      const internshipData = await this.internshipRepository.getInternship(id, arm);

      if (!internshipData) return {} as Internship;

      const internship = this.mapInternship(internshipData);

      return internship;
    } catch (e) {
      console.log(e);
      return { message: "Ocurrio un error al obtener la pasatía - Intente más tarde", error: e, ok: false };
    }
  }

  async uploadInternships(internships: Array<Internship & { careers: Array<string> }>) {
    return await this.internshipRepository.uploadInternships(internships);
  }

  mapInternship(
    internship: Internship & {
      Company: { name: string; id: string };
      University: { name: string; id: string };
      internshipCareers: Array<{ career_id: string; Career: { name: string; color: string; bg: string } }>;
    },
  ) {
    const createdAtMillis = internship?.created_at ? new Date(internship.created_at).getTime() : Date.now();
    const daysSince = (Date.now() - createdAtMillis) / (1000 * 60 * 60 * 24);

    let timeSinceCreated: string;
    let color: string;

    if (daysSince < 1) {
      timeSinceCreated = `Hace ${Math.ceil(daysSince * 24)} hs`;
    } else {
      timeSinceCreated = `Hace ${Math.floor(daysSince)} d`;
    }

    switch (true) {
      case daysSince >= 0 && daysSince <= 14:
        // Green
        color = TIME_SINCE_CREATED_COLORS.green;
        break;

      case daysSince >= 15 && daysSince <= 30:
        // Yellow
        color = TIME_SINCE_CREATED_COLORS.yellow;
        break;
      default:
        // Red
        color = TIME_SINCE_CREATED_COLORS.red;
        break;
    }

    const newInternship = {
      id: internship?.id,
      arm: internship?.arm,
      city: internship?.city,
      rrhh: !internship?.rrhh ? PLACEHOLDER.rrhh : internship?.rrhh,
      interview_timetable: internship?.interview_timetable,
      knowledge: internship?.knowledge,
      requirements: !internship?.requirements ? PLACEHOLDER.requirements : internship?.requirements,
      payment: !internship?.payment || internship?.payment === 0 ? PLACEHOLDER.payment : internship?.payment,
      timetable: internship?.timetable,
      position: !internship?.position ? PLACEHOLDER.position : internship?.position,
      benefits: internship?.benefits ?? PLACEHOLDER.benefits,
      interns: !internship?.interns ? PLACEHOLDER.interns : internship?.interns,
      workplace: !internship?.workplace ? PLACEHOLDER.workplace : internship.workplace,
      modality: !internship?.modality ? PLACEHOLDER.modality : internship?.modality,
      link: !internship?.link ? PLACEHOLDER.link : internship?.link,
      mail: !internship?.mail ? PLACEHOLDER.mail : internship?.mail,
      observations: !internship?.observations ? "-" : internship?.observations,
      company: { id: internship?.Company?.id, name: !internship?.Company?.name ? PLACEHOLDER.company : internship?.Company?.name },
      university: { id: internship?.university_id ?? "", name: internship?.University?.name },
      careers: internship?.internshipCareers?.map((career) => ({
        id: career?.career_id,
        name: career?.Career?.name,
        color: career?.Career?.color,
        bg: career?.Career?.bg,
      })),
      timeSinceCreated: { time: timeSinceCreated, color: color },
      created_at: internship?.created_at,
    };

    return newInternship;
  }
}
