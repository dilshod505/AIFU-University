"use client";

import React from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Send,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#0A1C36] text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        {/* Logo and About */}
        <div>
          <h2 className="text-3xl font-bold">
            <span className="text-white">A</span>
            <span className="text-pink-600">IFU</span>
          </h2>
          <p className="mt-4 text-sm text-gray-300">
            Aniq va ijtimoiy fanlar universiteti o‘zining keng qamrovli va
            zamonaviy ta’lim dasturlari bilan talabalariga yuqori darajada bilim
            olish imkoniyatini taqdim etadi.
          </p>
          <p className="mt-4 font-semibold">Obuna bo‘ling:</p>
          <div className="flex gap-3 mt-2">
            <Link
              href="https://www.facebook.com/aifu2022"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Facebook size={18} />
            </Link>
            <Link
              href="https://www.instagram.com/aifu.official?igshid=OGQ2MjdiOTE%3D"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href="https://www.youtube.com/@AIFU_offical"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Youtube size={18} />
            </Link>
            <Link
              href="https://t.me/aifu_university"
              className="p-2 bg-[#0F264A] rounded-lg hover:bg-pink-600 transition"
            >
              <Send size={18} />
            </Link>
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="font-bold text-lg mb-3">Foydali havolalar</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#">Bakalavriat</a>
            </li>
            <li>
              <a href="#">Magistratura</a>
            </li>
            <li>
              <a href="#">Maxsus kurslar</a>
            </li>
            <li>
              <a href="#">Loyiha va grantlar</a>
            </li>
            <li>
              <a href="#">Konferensiya va seminarlar</a>
            </li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-bold text-lg mb-3">Ma’lumotlar</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#">Xalqaro grantlar</a>
            </li>
            <li>
              <a href="#">Xalqaro reytinglar</a>
            </li>
            <li>
              <a href="#">Xalqaro hamkor tashkilotlar</a>
            </li>
            <li>
              <a href="#">Work and travel dasturi</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-3">Bog‘lanish</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-1" />
              Toshkent shahar, Olmazor tumani <br /> Qorasaroy ko‘chasi 341A
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
        Copyright © 2024 Aifu. Barcha huquqlar himoyalangan
      </div>
    </footer>
  );
};

export default Footer;
