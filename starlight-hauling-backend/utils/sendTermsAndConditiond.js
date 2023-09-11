import CompanyMailSettingsRepository from '../repos/companyMailSettings.js';
import CustomerRepository from '../repos/customer.js';
import TermsAndConditionsRepository from '../repos/termsAndConditions.js';
import { sendTermsAndConditionsEmail } from '../services/email.js';
import { sendTermsAndConditionsUrlSms } from '../services/sms.js';

const sendTermsAndConditions = async (customerId, ctx) => {
  const customerRepo = CustomerRepository.getInstance(ctx.state);
  const termAndConditionsRepo = TermsAndConditionsRepository.getInstance(ctx.state);
  const companyMailSettingsRepo = CompanyMailSettingsRepository.getInstance(ctx.state);

  const customer = await customerRepo.getBy({ condition: { id: customerId } });
  if (customer.tcId) {
    const termsAndConditions = await termAndConditionsRepo.getById(customer.tcId);
    const mailSettings = await companyMailSettingsRepo.getBy({
      condition: { tenantId: ctx.state.user.tenantId },
    });

    if (termsAndConditions && mailSettings) {
      const newUrl = `${ctx.request.header.origin}/terms-conditions/${ctx.state.user.tenantName}/${termsAndConditions.tcReqId}`;
      if (termsAndConditions.tcEmail) {
        sendTermsAndConditionsEmail(
          termsAndConditions.tcEmail,
          customer.businessUnit,
          newUrl,
          mailSettings,
        );
      }
      if (termsAndConditions.tcPhone) {
        sendTermsAndConditionsUrlSms(termsAndConditions.tcPhone, newUrl, customer.businessUnit);
      }
    }
  }
};

export default sendTermsAndConditions;
