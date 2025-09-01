import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Roboto_Slab } from "next/font/google";
import Link from "next/link";

const robotoSlab = Roboto_Slab({
  weight: "600",
  subsets: ["latin"],
});

const Footer = () => {
  const t = useTranslations();

  return (
    <footer className="bg-[#0A1C36] text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        {/* Logo and About */}
        <div>
          <h2
            className={`text-3xl font-bold tracking-[-5px] ${robotoSlab.className}`}
          >
            <span className="text-white">A</span>
            <span className="text-pink-600">I</span>
            <span className="text-white">F</span>
            <span className="text-pink-600">U</span>
          </h2>
          <p className="mt-4 text-sm text-gray-300">
            {t(
              "Aniq va ijtimoiy fanlar universiteti o‘zining keng qamrovli va zamonaviy ta’lim dasturlari bilan talabalariga yuqori darajada bilim olish imkoniyatini taqdim etadi"
            )}
          </p>
          <p className="mt-4 font-semibold">{t("Obuna boling")}:</p>
          <div className="flex gap-3 mt-2">
            <Link
              target={"_blank"}
              href="https://www.facebook.com/aifu2022"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Facebook size={18} />
            </Link>
            <Link
              target={"_blank"}
              href="https://www.instagram.com/aifu.official?igshid=OGQ2MjdiOTE%3D"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Instagram size={18} />
            </Link>
            <Link
              target={"_blank"}
              href="https://www.youtube.com/@AIFU_offical"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Youtube size={18} />
            </Link>
            <Link
              target={"_blank"}
              href="https://t.me/aifu_university"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Send size={18} />
            </Link>
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="font-bold text-lg mb-3">{t("Foydali havolalar")}</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link target={"_blank"} href="#">
                {t("Bakalavriat")}
              </Link>
            </li>
            <li>
              <Link target={"_blank"} href="#">
                {t("Magistratura")}
              </Link>
            </li>
            <li>
              <Link target={"_blank"} href="#">
                {t("Maxsus kurslar")}
              </Link>
            </li>
            <li>
              <Link target={"_blank"} href="#">
                {t("Loyiha va grantlar")}
              </Link>
            </li>
            <li>
              <Link target={"_blank"} href="#">
                {t("Konferensiya va seminarlar")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-bold text-lg mb-3">{t("Ma’lumotlar")}</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#">{t("Xalqaro grantlar")}</a>
            </li>
            <li>
              <a href="#">{t("Xalqaro reytinglar")}</a>
            </li>
            <li>
              <a href="#">{t("Xalqaro hamkor tashkilotlar")}</a>
            </li>
            <li>
              <a href="#">{t("Work and travel dasturi")}</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-3">{t("Boglanish")}</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-1" />
              {t("Toshkent shahar")}, {t("Olmazor tumani")} <br />{" "}
              {t("Qorasaroy ko‘chasi 341A-uy")}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> (+998) 78 555 21 21
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> info@aifu.uz
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm text-gray-400">
        {t("Copyright")} © {new Date().getFullYear()} AIFU.{" "}
        {t("Barcha huquqlar himoyalangan")}
      </div>
    </footer>
  );
};

export default Footer;
