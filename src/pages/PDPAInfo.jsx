import { IconShield } from "../components/Icons";

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <h2 className="font-bold text-gray-800 mb-2">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

function PDPAInfo() {
  return (
    <div className="space-y-4 pb-6">
      <div className="relative bg-gradient-to-br from-teal-500 via-teal-400 to-cyan-400 rounded-2xl p-6 text-white shadow-lg shadow-teal-200/40">
        <div className="flex items-center gap-2 mb-1">
          <IconShield className="w-5 h-5" />
          <h1 className="font-bold">ข้อควรรู้: PDPA</h1>
        </div>
        <p className="text-sm text-teal-50">
          การคุ้มครองข้อมูลด้านสินเชื่อภายในสหกรณ์
        </p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed px-1">
        ในยุคดิจิทัล "ข้อมูลส่วนบุคคล" ถือเป็นสิ่งมีค่าและต้องได้รับการคุ้มครอง
        พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) จึงเข้ามามีบทบาทสำคัญในการสร้างมาตรฐานใหม่
        เพื่อให้สมาชิกสหกรณ์ทุกคนมั่นใจได้ว่า ข้อมูลของท่านจะถูกนำไปใช้ประโยชน์อย่างโปร่งใสและปลอดภัย
      </p>

      <p className="text-sm text-gray-600 leading-relaxed px-1">
        เพื่อให้เป็นไปตามกฎหมายดังกล่าว สหกรณ์จึงได้วาง
        "ระเบียบสหกรณ์ว่าด้วยการใช้ข้อมูลส่วนบุคคล" สำหรับการดำเนินงานภายในไว้ดังนี้:
      </p>

      <Section title="1. ระเบียบการจัดเก็บข้อมูลที่จำเป็น">
        <p>
          สหกรณ์จะจัดเก็บและใช้ข้อมูลของสมาชิกเฉพาะที่จำเป็นต่อการดำเนินงานเท่านั้น ได้แก่:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>ชื่อ - นามสกุล: เพื่อยืนยันตัวตนความเป็นสมาชิก</li>
          <li>
            ข้อมูลสินเชื่อ: วงเงินกู้ ประวัติการชำระหนี้ และข้อมูลเกี่ยวกับด้านธุรกรรมสินเชื่อเท่านั้น
          </li>
        </ul>
      </Section>

      <Section title="2. ระเบียบการใช้งานและวัตถุประสงค์ภายใน">
        <p>
          สหกรณ์กำหนดให้มีการประมวลผลข้อมูลดังกล่าวเฉพาะงานด้านสินเชื่อภายในสหกรณ์เท่านั้น
          โดยอาศัยอำนาจตามระเบียบสหกรณ์ในการ:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            ใช้พิจารณาอนุมัติ จัดทำสัญญากู้ยืม และบริหารจัดการหนี้สินตามที่สมาชิกยื่นความประสงค์
          </li>
          <li>
            ใช้ประกาศหรือแจ้งเตือนภายในกลุ่มสมาชิกเท่าที่จำเป็น
            โดยไม่มีการเปิดเผยข้อมูลนี้แก่บุคคลภายนอก เว้นแต่เป็นการปฏิบัติตามกฎหมายที่เกี่ยวข้องกับสหกรณ์
          </li>
        </ul>
      </Section>

      <Section title="3. ระเบียบการจำกัดสิทธิ์และการรักษาความปลอดภัย">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-medium text-gray-700">จำกัดผู้เข้าถึง:</span>{" "}
            ระเบียบสหกรณ์กำหนดให้ข้อมูลธุรกรรมสินเชื่อเข้าถึงได้เฉพาะ คณะกรรมการสหกรณ์
            ที่มีอำนาจอนุมัติ และ เจ้าหน้าที่สินเชื่อ ที่รับผิดชอบโดยตรงเท่านั้น
          </li>
          <li>
            <span className="font-medium text-gray-700">ระบบความปลอดภัย:</span>{" "}
            จัดเก็บในระบบคอมพิวเตอร์ที่มีการล็อกรหัสผ่านอย่างเข้มงวด
            ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
          </li>
        </ul>
      </Section>

      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
        <h2 className="font-bold text-teal-800 mb-2">สรุป</h2>
        <p className="text-sm text-teal-700 leading-relaxed">
          การใช้ข้อมูล ชื่อ-นามสกุล และประวัติสินเชื่อทั้งหมด
          เป็นไปเพื่อการบริหารจัดการและบริการด้านสินเชื่อภายในสหกรณ์เท่านั้น ไม่เกี่ยวข้องกับระบบอื่น
          สมาชิกจึงมั่นใจได้ว่าข้อมูลของท่านจะได้รับการดูแลอย่างปลอดภัยและถูกต้องตามกฎหมาย PDPA ทุกประการ
        </p>
      </div>
    </div>
  );
}

export default PDPAInfo;
