import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2,
  Facebook, Twitter, Instagram, Youtube 
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import toast from 'react-hot-toast';

export const ContactPage = () => {
  const { settings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading spinner

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          // Use the React state directly here:
          from_name: `${formData.name} - GHS Kasala Portal Inquiry`,
          subject: formData.subject || "New Inquiry from Portal",
          replyto: formData.email,
          ...formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Success:", result);
        toast.success("Message sent successfully!");
        setSubmitted(true); // Trigger the success UI screen
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' }); // Clear form
      } else {
        console.error("Error:", result);
        toast.error(result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to send message. Please check your connection.");
    } finally {
      setIsSubmitting(false); // Stop loading spinner regardless of success/fail
    }
  };

  const schoolName = settings?.school_name || 'Government High School Kasala';
  const locationAddress = settings?.location_address || 'Abbottabad, Khyber Pakhtunkhwa';
  const schoolPhone = settings?.phone || '+92 992 000000';
  const schoolEmail = settings?.email || 'info@ghskasala.edu.pk';
  
  // Check if at least one social media link exists in the database
  const hasSocialLinks = 
    settings?.facebook_url || 
    settings?.twitter_url || 
    settings?.instagram_url || 
    settings?.youtube_url;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 sm:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Contact {schoolName}
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Have questions about admissions, examination results, or school timings? Send us a message or visit our office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-3xl space-y-8 shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">School Contact Details</h2>
              <p className="text-xs text-slate-400">Official inquiries and administrative office</p>
            </div>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Address & Location</strong>
                  <span className="text-slate-400 text-xs leading-relaxed">{locationAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Telephone</strong>
                  <a href={`tel:${schoolPhone}`} className="text-slate-400 text-xs hover:text-amber-400 transition-colors">
                    {schoolPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Email Address</strong>
                  <a href={`mailto:${schoolEmail}`} className="text-slate-400 text-xs hover:text-amber-400 transition-colors">
                    {schoolEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-slate-800 pt-6">
                <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Visiting Hours</strong>
                  <span className="text-slate-400 text-xs">08:00 AM - 01:30 PM (Monday to Saturday)</span>
                </div>
              </div>

              {/* Dynamic Social Media Section */}
              {hasSocialLinks && (
                <div className="flex items-start gap-4 border-t border-slate-800 pt-6">
                  <div className="w-full">
                    <strong className="text-slate-200 block mb-3 text-sm">Follow Us on Social Media</strong>
                    <div className="flex gap-3">
                      {settings?.facebook_url && (
                        <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all" title="Facebook">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {settings?.twitter_url && (
                        <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 hover:bg-sky-500 hover:text-white hover:border-transparent transition-all" title="Twitter/X">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {settings?.instagram_url && (
                        <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 hover:bg-pink-600 hover:text-white hover:border-transparent transition-all" title="Instagram">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {settings?.youtube_url && (
                        <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/30 flex items-center justify-center text-amber-400 hover:bg-red-600 hover:text-white hover:border-transparent transition-all" title="YouTube">
                          <Youtube className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Send an Official Message
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-8 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-lg">Message Delivered Successfully</h3>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                  Thank you for contacting {schoolName}. Our administrative office will review your inquiry shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0300 1234567"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Inquiry regarding admissions / results"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message Details</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please write your inquiry here..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;