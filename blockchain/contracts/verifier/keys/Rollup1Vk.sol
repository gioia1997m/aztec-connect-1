// SPDX-License-Identifier: GPL-2.0-only
// Copyright 2020 Spilsbury Holdings Ltd

pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import {Types} from '../cryptography/Types.sol';
import {PairingsBn254} from '../cryptography/PairingsBn254.sol';

library Rollup1Vk {
  using PairingsBn254 for Types.G1Point;
  using PairingsBn254 for Types.G2Point;
  using PairingsBn254 for Types.Fr;

  function get_verification_key() internal pure returns (Types.VerificationKey memory) {
    Types.VerificationKey memory vk;

    vk.circuit_size = 2097152;
    vk.num_inputs = 38;
    vk.work_root = PairingsBn254.new_fr(
      0x1ded8980ae2bdd1a4222150e8598fc8c58f50577ca5a5ce3b2c87885fcd0b523
    );
    vk.domain_inverse = PairingsBn254.new_fr(
      0x30644cefbebe09202b4ef7f3ff53a4511d70ff06da772cc3785d6b74e0536081
    );
    vk.work_root_inverse = PairingsBn254.new_fr(
      0x19c6dfb841091b14ab14ecc1145f527850fd246e940797d3f5fac783a376d0f0
    );
    vk.Q1 = PairingsBn254.new_g1(
      0x080675f26a8e6368b14e0903b624a0c8f5ab0677f7a8b7992a0116afd1de05dc,
      0x3024e95478a901efe3392e5e96995128ae1abb6e90c36fa6a540753a4e181696
    );
    vk.Q2 = PairingsBn254.new_g1(
      0x2d342507bc68de04e151ff8cab4bcdb2aaac8b228c0090681fd255789127115b,
      0x2ed9ba880b9747218e19436f32304167b47cd4c2fd10d466a0dda926809f10d4
    );
    vk.Q3 = PairingsBn254.new_g1(
      0x0b461720526a6aee6defebbe99e28d6b0d1a9c555ddb659ba2f89004db49e41d,
      0x1c0bc250db1c6bb65e915c9d1da9475bb8f210d681e1ebc4776131a9d41394d9
    );
    vk.Q4 = PairingsBn254.new_g1(
      0x06dc9d3f0eaf586ad33c7c99a7ad017e62c23a425bca3b1321f88c0a982706ac,
      0x044b0724dac7943daa8a83be9851ca508146175b765a2923f171e68dabc2fe76
    );
    vk.Q5 = PairingsBn254.new_g1(
      0x124970c5902365cd71d6578c07e0594eb9b08ddd93c55aad3d587b5368b492dc,
      0x2ea796517156ad3e72d5f9c46b8b4ce712057981d889c110e075cba47f9adbc8
    );
    vk.QM = PairingsBn254.new_g1(
      0x2d6129546ada7537a06b9992d6874ae27c24778fd4850e5f60195e489a3c6906,
      0x0a6999f517734e4852916bd842dbecb89e093afffadaa8a3fbe912f4bf2fc8f0
    );
    vk.QC = PairingsBn254.new_g1(
      0x2dc68e8cb3f645b7017419dfb291aeb2f40dd86de1ee9b35cf3423e0a920322c,
      0x2bdfe1341ca16048489478702edc37b7ff90f895fa670275332a3525e3deb7dd
    );
    vk.QARITH = PairingsBn254.new_g1(
      0x071acb6ae352a056cc5509e053df2e3936795b302e5ec88f9a7eabe53a0820e8,
      0x2008813a38b46c4472d5d1e470729a9857d2cba907fa3b4f1f6750572833cb24
    );
    vk.QECC = PairingsBn254.new_g1(
      0x07db3614db5b86994514c2983d50dbf0b601b49382f7f98c7cee34d46a69e336,
      0x119378e87875acafe258f7dc29c6e3efb48264a77691bd482912e32273f37109
    );
    vk.QRANGE = PairingsBn254.new_g1(
      0x01cc59633d7229b4d8ceb84c940392859a8833e4dce6d5c4e77849fdb208d830,
      0x2074e5f86070913d15239a4c4f1477508ed28d924c6bda1ae4efef1bf07f29f0
    );
    vk.QLOGIC = PairingsBn254.new_g1(
      0x222546dbb984205229305de1be1d1336ac0a4b344c6571be8b0288c2eaacb0ea,
      0x0b3a2edfced86bb74c3ebd62807d9510a950da435ba07f28b043cb4882357417
    );
    vk.sigma_commitments[0] = PairingsBn254.new_g1(
      0x17f8770a7492cd0e1ffd4c329d36fa115eba2b9ffc50e8dbc7be4a7546278d60,
      0x2beacab8bc1a65dc58734c691ae8780f2d47ee291916cc7c74f3da9db724e90b
    );
    vk.sigma_commitments[1] = PairingsBn254.new_g1(
      0x2f675c9bff3688063fbcb407e268219830abd166fc4b7df9179f5c1f286eb154,
      0x2c62c2aa5d74e8b49b80008fccbe79e57973476a049d399f2d7aa34dccbe3f18
    );
    vk.sigma_commitments[2] = PairingsBn254.new_g1(
      0x1b0078e9d85da3b73b48ae085a2003deafeb9751dd084b7dab429df10eec17e1,
      0x20e8eeb168600a25e5696771d96da06ff6c67e6fe242eea6747e0d1b3d395607
    );
    vk.sigma_commitments[3] = PairingsBn254.new_g1(
      0x07e7d271b51cd82621ffd79ba21ace05178a892365a8ee2b7332558d6f16d365,
      0x141fa048ea0f2e8ff7685d08b8ad3519fa69efeba752a20f48f2964918e72f29
    );
    vk.permutation_non_residues[0] = PairingsBn254.new_fr(
      0x0000000000000000000000000000000000000000000000000000000000000005
    );
    vk.permutation_non_residues[1] = PairingsBn254.new_fr(
      0x0000000000000000000000000000000000000000000000000000000000000006
    );
    vk.permutation_non_residues[2] = PairingsBn254.new_fr(
      0x0000000000000000000000000000000000000000000000000000000000000007
    );
    vk.contains_recursive_proof = true;
    vk.recursive_proof_indices[0] = 22;
    vk.recursive_proof_indices[1] = 23;
    vk.recursive_proof_indices[2] = 24;
    vk.recursive_proof_indices[3] = 25;
    vk.recursive_proof_indices[4] = 26;
    vk.recursive_proof_indices[5] = 27;
    vk.recursive_proof_indices[6] = 28;
    vk.recursive_proof_indices[7] = 29;
    vk.recursive_proof_indices[8] = 30;
    vk.recursive_proof_indices[9] = 31;
    vk.recursive_proof_indices[10] = 32;
    vk.recursive_proof_indices[11] = 33;
    vk.recursive_proof_indices[12] = 34;
    vk.recursive_proof_indices[13] = 35;
    vk.recursive_proof_indices[14] = 36;
    vk.recursive_proof_indices[15] = 37;
    vk.g2_x = PairingsBn254.new_g2([
      0x260e01b251f6f1c7e7ff4e580791dee8ea51d87a358e038b4efe30fac09383c1,
      0x0118c4d5b837bcc2bc89b5b398b5974e9f5944073b32078b7e231fec938883b0
    ],[
      0x04fc6369f7110fe3d25156c1bb9a72859cf2a04641f99ba4ee413c80da6a5fe4,
      0x22febda3c0c0632a56475b4214e5615e11e6dd3f96e6cea2854a87d4dacc5e55
    ]);
    return vk;
  }
}
