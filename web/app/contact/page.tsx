export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto py-16 px-6">
                <h1 className="text-3xl font-bold text-navy-900 mb-8">Contact Us</h1>
                <div className="prose prose-slate max-w-none text-slate-600">
                    <p className="mb-8">
                        We value your feedback and are committed to keeping our data accurate. Whether you are a student, a school administrator, or just have a question, we want to hear from you.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-navy-900 mb-2">General Support</h3>
                            <p className="text-sm text-slate-500 mb-4">For questions about the website or how to use it.</p>
                            <a href="mailto:support@tradepath.org" className="text-primary font-bold hover:underline">support@tradepath.org</a>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-navy-900 mb-2">School Corrections</h3>
                            <p className="text-sm text-slate-500 mb-4">Represent a school? Let us know if any data needs updating.</p>
                            <a href="mailto:support@tradepath.org" className="text-primary font-bold hover:underline">support@tradepath.org</a>
                        </div>
                    </div>

                    <p className="text-sm text-slate-400">
                        Please note: We are a small team and will do our best to respond within 48 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
