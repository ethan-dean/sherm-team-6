import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DarkVeil from '../../components/effects/DarkVeil';

const fadeInStyle = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const AssessmentFinishedPage: React.FC = () => {
  return (
    <>
      <style>{fadeInStyle}</style>
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <DarkVeil
            hueShift={1000}
            speed={0.3}
            warpAmount={0.2}
          />
        </div>

        <Card className="w-full max-w-md shadow-2xl relative z-10 bg-[rgb(0_0_0_/_0.45)] backdrop-blur-sm" style={{animation: 'fadeIn 0.7s ease-in forwards', opacity: 0}}>
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Assessment Successfully Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-base text-gray-200">
              You will be reached out to soon with your results.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AssessmentFinishedPage;
