/**
 * Terms & Conditions and Privacy Policy, exactly as published on
 * https://www.fluidounce.co/terms.html and /privacy.html — wording,
 * capitalisation and punctuation are the brand's own and are reproduced
 * verbatim. Edit the copy here, not in the page components.
 *
 * Section ids match the live pages' anchors, so links such as
 * /terms/#section-8 keep pointing at the same clause.
 */

export type LegalBlock = { type: "p"; text: string } | { type: "list"; items: string[] };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  eyebrow: string;
  title: string;
  /** Shown under the title, as on the live page. */
  updated: string;
  intro: string;
  /** The closing line inside the document. */
  footer: string;
  sections: LegalSection[];
}

/** Heading of the table of contents on both documents. */
export const CONTENTS_LABEL = "Contents";

export const TERMS: LegalDocument = {
  eyebrow: "Legal Framework",
  title: "Terms & Conditions",
  updated: "Last Updated: March 8, 2026",
  intro: "By using fluidounce.co (\"our Site\") you agree to be bound by these Terms & Conditions of Website Use (\"Terms & Conditions\"). Please read these Terms & Conditions carefully prior to your use of our Site.",
  footer: "© 2021 FLUID OUNCE All Rights Reserved",
  sections: [
    {
      id: "intro-terms",
      heading: "Opening Terms",
      blocks: [
        { type: "p", text: "By using fluidounce.co (\"our Site\") you agree to be bound by these Terms & Conditions of Website Use (\"Terms & Conditions\"). Please read these Terms & Conditions carefully prior to your use of our Site. Please exit our Site immediately if you do not accept these Terms & Conditions, are not of a legal age for consuming alcoholic beverages in the country or other territory in which you are located, or are accessing our Site in a country or other territory where use of our Site is not permitted." },
        { type: "p", text: "When you use our Site or send emails to us, you are communicating with us electronically. You consent to receive communications from us electronically. We will communicate with you by email, by posting notices on our Site, and/or through an account you maintain with us. You acknowledge and agree that all agreements, notices, disclosures and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing." },
      ],
    },
    {
      id: "section-1",
      heading: "1. Changes to Terms",
      blocks: [
        { type: "p", text: "We may make changes to these Terms & Conditions from time to time. If we make material changes, we will make reasonable efforts to provide you with notice and, where required by law, we will obtain your consent before implementing such changes. Unless expressly otherwise agreed, all material changes will apply prospectively only. If you have submitted an email address to us, we may notify you of the changes via email. If you have an account with us, we may ask you to affirmatively consent to the changes at the time of your next account log-in. By continuing to use our Site after such notice and/or consent, you are bound by these Terms & Conditions as modified." },
      ],
    },
    {
      id: "section-2",
      heading: "2. Additional Terms",
      blocks: [
        { type: "p", text: "Certain services offered by or through our Site may be governed by additional terms and conditions presented in conjunction with them. You must agree to the additional terms before using such services. These Terms & Conditions and any additional terms will apply equally. If any additional term is irrevocably inconsistent with any provision of these Terms & Conditions, the additional term will prevail." },
      ],
    },
    {
      id: "section-3",
      heading: "3. Intellectual Property Rights",
      blocks: [
        { type: "p", text: "All intellectual property and database rights, in our Site, and in the materials published on it, including but not limited to trademarks, designs, logos, text, images, audio and video materials, look and feel and software (including code, interface and website structure) (\"Materials\") are owned by us, protected in the United States of America and other countries. The Materials are protected by intellectual property laws and treaties around the world. All such rights are reserved. You may not remove any copyright or other proprietary notices from any Materials on our Site. We reserve the right to copy-protect any of the Materials on our Site." },
        { type: "p", text: "Except as expressly provided in these Terms & Conditions, we do not grant you any rights, title, interest or license to any Materials you may access on our Site. Provided that you are located in a country or other territory where the consumption of alcoholic beverages is permitted AND that you are of a legal age to consume alcoholic beverages in the country or other territory in which you are located, you may print a reasonable number of hard copies, and may download extracts, of any page(s) from our Site for your lawful, personal, non-commercial use only." },
        { type: "p", text: "Unless otherwise specifically authorized by us (by way of example only, explicit instructions such as \"Click Here to Enlarge this Image\") you must not modify the paper or digital copies of any Materials you have printed off or downloaded in any way, and you must not use any illustrations, photographs, video or audio sequences or any graphics separately from any accompanying text or proprietary notice." },
        { type: "p", text: "All other copying (whether in electronic, hard copy or other format), reproduction, transmission, public performance, public display, uploading, posting, transmission, distribution, commercial exploitation, adaptation, translation, modification, bundling, merging, sharing or making available to any person, or creation of any derivative works of our Site or the Materials on our Site is strictly prohibited and may constitute a violation of intellectual property laws and other laws worldwide." },
        { type: "p", text: "The status of the relevant Owners (and that of any identified contributors) as the holders of rights in the Materials on our Site must always be acknowledged. You must not use any part of the Materials on our Site for commercial purposes without obtaining a license to do so from us and/or, where applicable, from the relevant Owner. If you print off, copy or download any part of our Site in breach of these Terms & Conditions, your right to use our Site will cease immediately and you must, at our option, return or destroy any copies of the Materials you have made." },
      ],
    },
    {
      id: "section-4",
      heading: "4. Acceptable Use",
      blocks: [
        { type: "p", text: "You may use our Site and Materials only for lawful, personal and non-commercial purposes and we reserve the right, in our sole discretion, to terminate your use of our Site. You may not use our Site:" },
        {
          type: "list",
          items: [
            "(a) In any way that breaches any applicable local, national or international law or regulation;",
            "(b) In any way that is unlawful or fraudulent, or has any unlawful or fraudulent purpose or effect;",
            "(c) For the purpose of harming or attempting to harm minors in any way;",
            "(d) To send, knowingly receive, upload, download, use or re-use any Material which does not comply with our content standards set forth below in the section entitled \"Materials Submitted by You\";",
            "(e) To transmit, or procure the sending of, any unsolicited or unauthorized advertising or promotional material or any other form of similar solicitation (spam);",
            "(f) To knowingly transmit any data, send or upload any material that contains viruses, Trojan horses, worms, time-bombs, keystroke loggers, spyware, adware or any other harmful programs or similar computer code designed to adversely affect the operation of any computer software or hardware (\"Malicious Code\"); or",
            "(g) Any other uses or activities that we determine, in our sole discretion, are illegal, abusive, harmful or improper.",
          ],
        },
      ],
    },
    {
      id: "section-5",
      heading: "5. Third Party Goods and Services",
      blocks: [
        { type: "p", text: "FROM TIME TO TIME OUR SITE MAY DISPLAY ADVERTISEMENTS OF GOODS AND/OR SERVICES OF THIRD PARTIES. WE DO NOT VOUCH FOR NOR ENDORSE SUCH THIRD PARTIES OR ANY OF THEIR GOODS OR SERVICES. YOUR COMMUNICATIONS AND BUSINESS DEALINGS WITH SUCH THIRD PARTIES ARE SOLELY BETWEEN YOU AND SUCH THIRD PARTIES. YOU AGREE THAT WE SHALL NOT BE RESPONSIBLE OR LIABLE FOR ANY LOSS OR DAMAGE YOU MAY INCUR AS A RESULT OF YOUR COMMUNICATIONS AND BUSINESS DEALINGS WITH SUCH THIRD PARTIES." },
      ],
    },
    {
      id: "section-6",
      heading: "6. Your Responsibilities",
      blocks: [
        { type: "p", text: "You may use our Site for lawful, personal and non-commercial purposes only. You may not use our Site in any manner that could damage, disable, overburden, or impair our servers or networks or interfere with any other party's use and enjoyment of our Site." },
        { type: "p", text: "You may not attempt to gain unauthorized access to our Site, other users' accounts or our computer systems or networks, through hacking, password mining or any other means. Without limiting any of the foregoing, you agree that you shall not (and you agree not to encourage or allow any third party to):" },
        {
          type: "list",
          items: [
            "copy, modify, adapt, translate, reverse engineer, decode or otherwise attempt to derive or gain access to any portion of our Site or Materials;",
            "remove any copyright, trademark or other proprietary rights notices contained in our Site or Materials;",
            "use any robot, spider, Site search/retrieval application, or other automated device, process or means to access, retrieve, scrape or index any portion of our Site or Materials;",
            "rent, lease, lend, sell, sublicense, assign, distribute, publish, transfer or otherwise make available our Site or any features or functionality of our Site, to any third party for any reason, including by making our Site available on a network where it is capable of being accessed by more than one device at any time;",
            "reformat or frame any portion of the web pages that are part of our Site;",
            "use \"FLUID OUNCE\" or any of our other trademarks as meta tags or ad keywords;",
            "impersonate another person or entity, or falsify account information, or make unauthorized use of another person's or entity's information; or",
            "collect or store personal data about any other user without his/her express prior written consent.",
          ],
        },
        { type: "p", text: "We have the discretion to terminate your access to our Site without notice for any violation of the above rules. We also may remove all or any part of our Site at any time in our sole discretion." },
      ],
    },
    {
      id: "section-7",
      heading: "7. Materials Submitted by You",
      blocks: [
        { type: "p", text: "Unless specifically requested, we do not solicit nor do we wish to receive any confidential, secret or proprietary information or material from you through our Site, or in any other way. Any information or material submitted by you and which has not been specifically requested by us (\"Your Material\") will be deemed not to be confidential, secret or proprietary." },
        { type: "p", text: "You agree that Your Material, whether ideas, creative concepts or other materials, may be used, reproduced and disclosed by us freely without restriction for whatever purpose we deem fit and without payment of any sum or acknowledgement of you as the source. You also warrant that any \"moral rights\" in Your Material have been irrevocably waived by their authors. To the extent you provide us with any information or materials originated from or relating to a third party, you represent and warrant that you have received that third party's express written consent (a) authorizing you to disclose such information or materials to us and (b) allowing such information or materials to be used, reproduced and disclosed by us freely without restriction for whatever purpose we deem fit and without payment of any sum or acknowledgement of such third party as the source." },
        { type: "p", text: "WE SHALL HAVE NO LIABILITY FOR ANY LOSS OR DAMAGE SUFFERED BY YOU AS A RESULT OF OUR USE OR DISCLOSURE (TO THE EXTENT PERMITTED BY LAW) OF YOUR MATERIAL. This section does not affect any rights you may have under data privacy laws that protect your personal information or similar privacy laws, to the extent that such rights cannot be excluded." },
        { type: "p", text: "We reserve the right, at any time and in our sole discretion, to reject and remove any information or materials submitted by you that, in our sole judgment, violates these Terms & Conditions or any applicable law or may expose or subject our company or our Site to liability of any kind or may adversely affect our reputation or goodwill or our Site." },
      ],
    },
    {
      id: "section-8",
      heading: "8. Privacy",
      blocks: [
        { type: "p", text: "In the course of your use of our Site, you may be asked to provide personal information to us (\"Personal Information\"). Our information collection and use policies with respect to Personal Information are set forth in our Privacy Policy, which is incorporated into these Terms & Conditions by reference. You acknowledge and agree that you are solely responsible for the accuracy and content of the Personal Information that you furnish to us." },
      ],
    },
    {
      id: "section-9",
      heading: "9. Links to Third-Party Sites",
      blocks: [
        { type: "p", text: "For your convenience, our Site may display links to third-party websites (\"Linked Sites\"). You acknowledge and agree that we do not assume any responsibility for Linked Sites. Links to Linked Sites do not constitute our endorsement or approval of, or our association or affiliation with, such sites or the content, products, advertising or other materials presented on such sites." },
        { type: "p", text: "We have no control over these Linked Sites and do not edit or monitor them. You acknowledge and agree that we are not responsible or liable, directly or indirectly, for any damage, loss or cost caused or alleged to be caused by or in connection with use of or reliance on any information, content, goods or services available on such Linked Sites. No website may be linked to our Site or its pages without our prior written consent." },
      ],
    },
    {
      id: "section-10",
      heading: "10. Restriction, Suspension and Termination",
      blocks: [
        { type: "p", text: "We may restrict, suspend or terminate your access to our Site and/or your access to any services on our Site if we believe that you have breached these Terms & Conditions. Any such restriction, suspension or termination will be without prejudice to any rights that we may have against you with respect to your breach of these Terms & Conditions. Any provision of these Terms & Conditions that must survive in order to give proper effect to the intent and purposes of these Terms & Conditions shall so survive termination." },
      ],
    },
    {
      id: "section-11",
      heading: "11. Copyright Agent",
      blocks: [
        { type: "p", text: "We respect the intellectual property rights of others and require that the people who use our Site do the same. We respond to notices of alleged infringement as required by the U.S. Digital Millennium Copyright Act (\"DMCA\"), including by removing or disabling access to material claimed to be the subject of infringing activity. We also have implemented a policy of terminating, in appropriate circumstances, the accounts of registered users on our Site who are determined by us to be repeat infringers." },
        { type: "p", text: "If you believe that your work has been copied in a way that constitutes copyright infringement, please forward the following information to the Copyright Agent named below: (1) Your address, telephone number, and email address; (2) A description of the copyrighted work that you claim has been infringed; (3) A description of the alleged infringing activity and where the alleged infringing material is located; (4) statement by you that you have a good faith belief that the disputed use is not authorized by you, the copyright owner, its agent or the law; (5) An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright; and (6) statement by you, made under penalty of perjury, that the above information as submitted by you is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf." },
      ],
    },
    {
      id: "section-12",
      heading: "12. Governing Law and Jurisdiction",
      blocks: [
        { type: "p", text: "These Terms & Conditions are governed by and construed and enforced in accordance with the internal laws of the State of Connecticut without giving effect to the principles of conflicts of laws of such state and are binding upon the parties hereto in the United States and worldwide. You and we agree that the United Nations Convention on Contracts for the International Sale of Goods does not apply to the interpretation or construction of these Terms & Conditions." },
        { type: "p", text: "Our Site is based in the State of Connecticut in the United States. [If you access our Site from outside the United States, you are responsible for compliance with local laws.] To the extent that any software is accessible through our Site, such software may be subject to export, re-export and/or import controls imposed by the United States or any other jurisdiction and may not be downloaded or otherwise exported or re-exported: (a) into (or to a national or resident of) any country to which the U.S. has placed an embargo or which is subject to relevant export restrictions; (b) to anyone on the U.S. Treasury Department's Specially Designated Nationals list, or (c) in violation of the U.S. Commerce Department's Table of Denial Orders." },
      ],
    },
    {
      id: "section-13",
      heading: "13. Disclaimer of Warranties & Limitations of Liability",
      blocks: [
        { type: "p", text: "We warrant that we have validly entered into these Terms & Conditions and have the legal power to do so. You warrant that you have validly entered into these Terms & Conditions and have the legal power to do so. If you are accessing our Site from the United States of America, you represent and warrant that you are at least 21 years of age. If you are accessing our Site from any jurisdiction outside of the United States of America, you represent and warrant that you have reached the legal drinking age under the laws of the jurisdiction from which you are accessing our Site." },
        { type: "p", text: "EXCEPT AS EXPRESSLY PROVIDED ABOVE, THE SITE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. We specifically disclaim all warranties and conditions of any kind, including all implied warranties and conditions of merchantability, fitness for a particular purpose, title, non-infringement, freedom from defects, uninterrupted use and all warranties implied from any course of dealing or usage of trade. We do not warrant that (a) our Site will meet your requirements, (b) operation of our Site will be uninterrupted or virus- or error-free or (c) errors will be corrected. Any oral or written advice provided by us or its authorized agents does not and will not create any warranty. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES WHICH MEANS THAT SOME OR ALL OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU." },
        { type: "p", text: "YOUR USE OF OUR SITE IS AT YOUR OWN RISK." },
        { type: "p", text: "YOU AGREE THAT IN NO EVENT WILL WE BE LIABLE (Y) FOR DAMAGES OF ANY KIND, INCLUDING DIRECT, INDIRECT, SPECIAL, EXEMPLARY, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, LOSS OF USE, DATA OR PROFITS OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER ARISING IN ANY WAY IN CONNECTION WITH THESE TERMS AND WHETHER IN CONTRACT, STRICT LIABILITY OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE OR (Z) FOR ANY OTHER CLAIM, DEMAND OR DAMAGES WHATSOEVER RESULTING FROM OR ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OUR SITE. The foregoing disclaimer of liability will not apply to the extent prohibited by applicable law." },
        { type: "p", text: "IF FOR ANY REASON THE DISCLAIMERS OF WARRANTIES OR LIMITATIONS OF LIABILITY SET FORTH IN THIS SECTION 7 IS/ARE INAPPLICABLE OR UNENFORCEABLE FOR ANY REASON, THEN OUR MAXIMUM LIABILITY FOR ANY TYPE OF DAMAGES HEREUNDER SHALL BE LIMITED TO $1,000." },
        { type: "p", text: "You acknowledge and agree that the above limitations of liability together with the other provisions in these Terms & Conditions that limit liability are essential terms and that we would not be willing to grant you the rights set forth in these Terms & Conditions but for your agreement to the above limitations of liability." },
        { type: "p", text: "IF YOU ARE A CALIFORNIA RESIDENT, YOU WAIVE YOUR RIGHTS WITH RESPECT TO CALIFORNIA CIVIL CODE SECTION 1542, WHICH SAYS \"A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH, IF KNOWN BY HIM MUST HAVE MATERIALLY AFFECTED HIS SETTLEMENT WITH THE DEBTOR\"." },
      ],
    },
    {
      id: "section-14",
      heading: "14. Indemnification",
      blocks: [
        { type: "p", text: "You agree to indemnify and defend us and its directors, officers, employees and agents from and against all losses, liabilities, actual or pending claims, actions, damages, expenses, costs of defense and reasonable attorneys' fees brought against us by any third party arising from your use of our Site or any violation of these Terms & Conditions, the rights of a third party or applicable law. We reserve the right, at its own expense, to assume the exclusive defense and control of any matter subject to indemnification hereunder. No settlement that affects the rights or obligations of us may be made without our prior written approval." },
      ],
    },
    {
      id: "section-15",
      heading: "15. Dispute Resolution",
      blocks: [
        { type: "p", text: "YOU AND WE AGREE THAT EACH MAY BRING claims against the other only on an individual basis and not as a plaintiff or class member in any PURPORTED class or representative action or proceeding." },
        { type: "p", text: "[Confirm: YOU AND WE AGREE THAT ALL CLAIMS WILL BE RESOLVED BY BINDING ARBITRATION IN THE MANNER SPECIFIED IN THIS SECTION 15 AND THAT YOU AND WE WAIVE ANY RIGHT TO BRING SUCH CLAIMS BEFORE ANY COURT OF LAW." },
        { type: "p", text: "Any dispute between you and us and our agents, employees, officers, directors, principals, successors, assigns, subsidiaries or affiliates arising from or relating to these Terms & Conditions and their interpretation or the breach, termination or validity thereof, the relationships which result from these Terms & Conditions, including disputes about the validity, scope or enforceability of these Terms & Conditions to arbitration (collectively, \"Covered Disputes\") will be settled by binding arbitration in the State of Connecticut administered by the American Arbitration Association (AAA) in accordance with its rules (including its rules and procedures for consumer-related disputes) in effect on the date thereof. Prior to initiating any arbitration, the initiating party will give the other party at least 60 days' advanced written notice of its intent to file for arbitration. We will provide such notice by email to the email address that you provided to us through our Site and you must provide such notice to us by email at ____." },
        { type: "p", text: "Payment of all filing, administration and arbitrator fees will be governed by the AAA's rules. If, however, you are able to demonstrate that the costs of arbitration will be prohibitive for you as compared to the costs of litigation, we will pay as much of the filing, administration and arbitrator fees as the arbitrator deems necessary to prevent the arbitration from being cost-prohibitive for you. If the arbitrator determines the claim(s) you assert in the arbitration are frivolous, you agree to reimburse us for all fees associated with the arbitration that we paid on your behalf which you otherwise would be obligated to pay under the AAA's rules." },
        { type: "p", text: "A single arbitrator will be selected in accordance with the AAA Commercial Arbitration Rules. The arbitration shall be conducted in the English language. The arbitrator will have the power to grant whatever relief would be available in court under law or in equity and any award of the arbitrator will be final and binding on each of the parties and may be entered as a judgment in any court of competent jurisdiction. The arbitrator will not, however, have the power to award punitive or exemplary damages, the right to which each party hereby waives. The arbitrator will apply applicable law and the provisions of these Terms & Conditions and the failure to do so will be deemed an excess of arbitral authority and grounds for judicial review. The arbitrator's decision must be with written explanation and remain confidential. We and you agree that any Covered Dispute will be submitted to arbitration on an individual basis only. If any provision of the agreement to arbitrate in this Section 15 is found unenforceable, the unenforceable provision will be severed and the remaining arbitration terms will be enforced (but in no case will there be a class, representative or private attorney general arbitration). Regardless of any statute or law to the contrary, notice on any claim arising from or related to these Terms & Conditions must be made within one (1) year after such claim arose or be forever barred. For purposes of this Section 15, these Terms & Conditions and related transactions will be subject to and governed by the Federal Arbitration Act, 9 U.S.C. sec. 1-16 (FAA). ]" },
      ],
    },
    {
      id: "section-16",
      heading: "16. Entire Agreement",
      blocks: [
        { type: "p", text: "These Terms & Conditions, including our Privacy Policy, constitutes the entire agreement between you and us in relation to its subject matter and supersedes any and all prior promises, representations, agreements, statements and understandings whatsoever between us. To the extent that software is available through our Site, such software may be subject to a license agreement that is distributed or included with such software and you agree to abide by the terms and conditions of any such license agreements. The failure by us to exercise or enforce any right or provision of the Terms & Conditions shall not constitute a waiver of such right or provision. If any provision of the Terms & Conditions is found by a court of competent jurisdiction to be unenforceable or invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties' intentions as reflected in the provision, and the other provisions of the Terms & Conditions shall remain in full force and effect. We may cede assign or otherwise transfer our rights and obligations in terms of these Terms & Conditions to third parties. Nothing contained in these Terms & Conditions will be deemed to constitute us or you as the agent or representative of the other or as joint venturers or partners." },
        { type: "p", text: "If we or you are prevented from performing or unable to perform any obligation under these Terms & Conditions due to any cause beyond the reasonable control of the party invoking this provision, the affected party's performance will be extended for the period of delay or inability to perform due to such cause. Headings and captions are for convenience only." },
      ],
    },
  ],
};

export const PRIVACY: LegalDocument = {
  eyebrow: "Data & Transparency",
  title: "Privacy Policy",
  updated: "Last Updated: March 8, 2026",
  intro: "We respect and value your personal information. In compliance with privacy and data protection regulations, we provide this Privacy Notice.",
  footer: "© 2021 FLUID OUNCE All Rights Reserved",
  sections: [
    {
      id: "privacy-intro",
      heading: "Opening Statement",
      blocks: [
        { type: "p", text: "Privacy Policy" },
        { type: "p", text: "We respect and value your personal information. In compliance with privacy and data protection regulations, we provide this Privacy Notice." },
      ],
    },
    {
      id: "controller",
      heading: "Controller",
      blocks: [
        { type: "p", text: "FLUID OUNCE.CO" },
        { type: "p", text: "For any information regarding your personal information, please contact us at: info@FLUIDOUNCE.co." },
      ],
    },
    {
      id: "personal-data",
      heading: "Personal Data",
      blocks: [
        { type: "p", text: "In order for us to process your purchase order corporate gifts or personalized bottles, we will need to collect your personal data (\"Personal Data\"):" },
        {
          type: "list",
          items: [
            "Name",
            "Date of birth",
            "Billing or delivery address",
            "E-mail address",
            "Phone number (permanent and mobile) and fax number",
            "Payment information",
            "Tax ID and billing address (in case you need a tax invoice)",
          ],
        },
      ],
    },
    {
      id: "purpose",
      heading: "Purpose for collecting your Personal Data",
      blocks: [
        { type: "p", text: "Your Personal Data will be only processed for:" },
        {
          type: "list",
          items: [
            "Contact information.",
            "Registration and identification through our Website.",
            "Confirm you are legally allowed to buy and/or drink alcohol.",
            "Process your purchase orders.",
            "Subscribe our newsletter.",
            "Issue invoices",
          ],
        },
      ],
    },
    {
      id: "rights",
      heading: "Right to access, update, correct and/or request removal",
      blocks: [
        { type: "p", text: "Right to access, update, correct and/or request removal of your Personal Data from our databases and request that we restrict the processing of your Personal Data." },
        { type: "p", text: "You may at any time request your right to access, update, correct and/or request removal of your Personal Data from our databases and request that we restrict the processing of your Personal Data, by sending an e-mail to: info@FLUIDOUNCE.co. clearly indicating your request." },
      ],
    },
    {
      id: "withdraw",
      heading: "Withdrawal of Consent",
      blocks: [
        { type: "p", text: "You have the right to withdraw your consent at any time, and you can request we transmit your Personal Data to another data controller where applicable law requires us to do so by contacting us at: info@FLUIDOUNCE.co" },
      ],
    },
    {
      id: "changes",
      heading: "Changes in Privacy Notice",
      blocks: [
        { type: "p", text: "This Privacy Notice and every one of its updates will be available at our Website." },
      ],
    },
    {
      id: "transfers",
      heading: "Personal Data Transfers",
      blocks: [
        { type: "p", text: "Your Personal Data may only be transferred to non-related third parties to process and deliver your purchase through retailers in the United States of America." },
      ],
    },
    {
      id: "cookies",
      heading: "Use of cookies",
      blocks: [
        { type: "p", text: "We use cookies through our Website to compile statistical data on the use of our Website and its functioning, to facilitate users' ability to navigate through our Website, including remembering previous visitors." },
      ],
    },
  ],
};
